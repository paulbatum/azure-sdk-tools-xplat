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

        nockhelper.nock('https://management.core.windows.net')
        //nockhelper.nock('https://managementnext.rdfetest.dnsdemo4.com')
          .log(console.log)
          .post('/ba090344-f0ae-4520-b8a0-205635df65ed/services/mobileservices/mobileservices/pbadvisorsdemo/recover?targetMobileService=pb617')
          .reply(200, "", { 'cache-control': 'no-cache',
          pragma: 'no-cache',
          'transfer-encoding': 'chunked',
          expires: '-1',
          server: '33.0.6190.871 (rd_rdfe_n.130610-2140) Microsoft-HTTPAPI/2.0',
          'x-powered-by': 'ASP.NET',
          'x-ms-request-id': '58543a3771d8444c9a63e196568cde99',
          date: 'Tue, 18 Jun 2013 17:09:40 GMT' })
        
          .delete('/ba090344-f0ae-4520-b8a0-205635df65ed/applications/pb617mobileservice')
          .reply(202, "", { 'cache-control': 'no-cache',
          'content-length': '0',
          server: '33.0.6190.871 (rd_rdfe_n.130610-2140) Microsoft-HTTPAPI/2.0',
          'x-ms-request-id': 'ea355dfe8247400b92c2170abed6dc2f',
          date: 'Tue, 18 Jun 2013 17:09:43 GMT' })
        
          .get('/ba090344-f0ae-4520-b8a0-205635df65ed/operations/ea355dfe8247400b92c2170abed6dc2f')
          .reply(200, "<Operation xmlns=\"http://schemas.microsoft.com/windowsazure\" xmlns:i=\"http://www.w3.org/2001/XMLSchema-instance\"><ID>ea355dfe-8247-400b-92c2-170abed6dc2f</ID><Status>Succeeded</Status><HttpStatusCode>200</HttpStatusCode></Operation>", { 'cache-control': 'no-cache',
          'content-length': '232',
          'content-type': 'application/xml; charset=utf-8',
          server: '33.0.6190.871 (rd_rdfe_n.130610-2140) Microsoft-HTTPAPI/2.0',
          'x-ms-request-id': '597f23a22ec645b398e0fb68f8d8967d',
          date: 'Tue, 18 Jun 2013 17:09:47 GMT' });

        // var scope = nockhelper.nock('https://management.core.windows.net')
        //   //.log(console.log)
        //   .post('/ba090344-f0ae-4520-b8a0-205635df65ed/services/mobileservices/mobileservices/foo/recover?targetMobileService=bar')
        //   .reply(200)
        //   .delete('/ba090344-f0ae-4520-b8a0-205635df65ed/applications/barmobileservice')
        //   .reply(202, {
        //     'x-ms-request-id': 'ef428fef8f634ac3b6368f3c0af84cb3'
        //   })        
        //   .get('/ba090344-f0ae-4520-b8a0-205635df65ed/operations/ef428fef8f634ac3b6368f3c0af84cb3')
        //   .reply(200, '<Operation xmlns=\"http://schemas.microsoft.com/windowsazure\" xmlns:i=\"http://www.w3.org/2001/XMLSchema-instance\"><ID>ef428fef-8f63-4ac3-b636-8f3c0af84cb3</ID><Status>Succeeded</Status><HttpStatusCode>200</HttpStatusCode></Operation>')
        //   ;

        //nockhelper.nock.recorder.rec();
        
        var cmd = ('node cli.js mobile recover pbadvisorsdemo pb617 -q -s ba090344-f0ae-4520-b8a0-205635df65ed').split(' ');
        executeCmd(cmd, function (result) {
          console.log(result);
          //result.exitStatus.should.equal(0);          
          done();
        });
      });
    });
  });
});