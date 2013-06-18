/**
* Copyright 2012 Microsoft Corporation
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*   http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/


require('should');
var sinon = require('sinon');
var nockhelper = require('../framework/nock-helper.js');
var executeCmd = require('../framework/cli-executor').execute;
var keyFiles = require('../../lib/util/keyFiles');

describe('cli', function(){
  describe('mobile', function() {
    describe('recover', function() {

      before(function (done) {        
        process.env.AZURE_ENABLE_STRICT_SSL = false;

        sinon.stub(keyFiles, 'readFromFile', function () {                    
          return {
            cert: process.env.AZURE_CERTIFICATE,
            key: process.env.AZURE_CERTIFICATE_KEY
          };
        });

        sinon.stub(keyFiles, 'writeToFile', function () {});
        done();
      });

      after(function (done) {        
        delete process.env.AZURE_ENABLE_STRICT_SSL;

        if (keyFiles.readFromFile.restore) {
          keyFiles.readFromFile.restore();
        }

        if (keyFiles.writeToFile.restore) {
          keyFiles.writeToFile.restore();
        }

        done();
      });

      beforeEach(function (done) {      
        nockhelper.nockHttp();
        done();
      });

      afterEach(function (done) {
        nockhelper.unNockHttp();
        done();
      });

      it('should recover', function(done) {

        var scope = nockhelper.nock('https://management.core.windows.net')
          //.log(console.log)
          .post('/ba090344-f0ae-4520-b8a0-205635df65ed/services/mobileservices/mobileservices/foo/recover?targetMobileService=bar')
          .reply(200)
          .delete('/ba090344-f0ae-4520-b8a0-205635df65ed/applications/barmobileservice')
          .reply(202, {
            'x-ms-request-id': 'ef428fef8f634ac3b6368f3c0af84cb3'
          })        
          .get('/ba090344-f0ae-4520-b8a0-205635df65ed/operations/ef428fef8f634ac3b6368f3c0af84cb3')
          .reply(200, '<Operation xmlns=\"http://schemas.microsoft.com/windowsazure\" xmlns:i=\"http://www.w3.org/2001/XMLSchema-instance\"><ID>ef428fef-8f63-4ac3-b636-8f3c0af84cb3</ID><Status>Succeeded</Status><HttpStatusCode>200</HttpStatusCode></Operation>')
          ;
        
        var cmd = ('node cli.js mobile recover foo bar -q -s ba090344-f0ae-4520-b8a0-205635df65ed').split(' ');
        executeCmd(cmd, function (result) {
          console.log(result);
          result.exitStatus.should.equal(0);
          scope.done();
          done();
        });
      });
    });
  });
});