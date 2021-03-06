import commands from '../../commands';
import Command, { CommandOption, CommandError, CommandValidate } from '../../../../Command';
import * as sinon from 'sinon';
import appInsights from '../../../../appInsights';
import auth, { Site } from '../../SpoAuth';
const command: Command = require('./term-set-get');
import * as assert from 'assert';
import * as request from 'request-promise-native';
import config from '../../../../config';
import Utils from '../../../../Utils';

describe(commands.TERM_SET_GET, () => {
  let vorpal: Vorpal;
  let log: string[];
  let cmdInstance: any;
  let cmdInstanceLogSpy: sinon.SinonSpy;
  let trackEvent: any;
  let telemetry: any;

  before(() => {
    sinon.stub(auth, 'restoreAuth').callsFake(() => Promise.resolve());
    sinon.stub(auth, 'ensureAccessToken').callsFake(() => { return Promise.resolve('ABC'); });
    sinon.stub(command as any, 'getRequestDigest').callsFake(() => Promise.resolve({ FormDigestValue: 'ABC' }));
    trackEvent = sinon.stub(appInsights, 'trackEvent').callsFake((t) => {
      telemetry = t;
    });
  });

  beforeEach(() => {
    vorpal = require('../../../../vorpal-init');
    log = [];
    cmdInstance = {
      log: (msg: string) => {
        log.push(msg);
      }
    };
    cmdInstanceLogSpy = sinon.spy(cmdInstance, 'log');
    auth.site = new Site();
    telemetry = null;
  });

  afterEach(() => {
    Utils.restore([
      vorpal.find,
      request.post
    ]);
  });

  after(() => {
    Utils.restore([
      appInsights.trackEvent,
      auth.ensureAccessToken,
      auth.restoreAuth,
      (command as any).getRequestDigest
    ]);
  });

  it('has correct name', () => {
    assert.equal(command.name.startsWith(commands.TERM_SET_GET), true);
  });

  it('has a description', () => {
    assert.notEqual(command.description, null);
  });

  it('calls telemetry', (done) => {
    cmdInstance.action = command.action();
    cmdInstance.action({ options: {}, url: 'https://contoso-admin.sharepoint.com' }, () => {
      try {
        assert(trackEvent.called);
        done();
      }
      catch (e) {
        done(e);
      }
    });
  });

  it('logs correct telemetry event', (done) => {
    cmdInstance.action = command.action();
    cmdInstance.action({ options: {}, url: 'https://contoso-admin.sharepoint.com' }, () => {
      try {
        assert.equal(telemetry.name, commands.TERM_SET_GET);
        done();
      }
      catch (e) {
        done(e);
      }
    });
  });

  it('aborts when not connected to a SharePoint site', (done) => {
    auth.site = new Site();
    auth.site.connected = false;
    cmdInstance.action = command.action();
    cmdInstance.action({ options: { debug: true } }, (err?: any) => {
      try {
        assert.equal(JSON.stringify(err), JSON.stringify(new CommandError('Log in to a SharePoint Online site first')));
        done();
      }
      catch (e) {
        done(e);
      }
    });
  });

  it('aborts when not connected to a SharePoint tenant admin site', (done) => {
    auth.site = new Site();
    auth.site.connected = true;
    auth.site.url = 'https://contoso.sharepoint.com';
    cmdInstance.action = command.action();
    cmdInstance.action({ options: { debug: true } }, (err?: any) => {
      try {
        assert.equal(JSON.stringify(err), JSON.stringify(new CommandError(`${auth.site.url} is not a tenant admin site. Log in to your tenant admin site and try again`)));
        done();
      }
      catch (e) {
        done(e);
      }
    });
  });

  it('gets taxonomy term set by id, term group by id', (done) => {
    sinon.stub(request, 'post').callsFake((opts) => {
      if (opts.url.indexOf('/_vti_bin/client.svc/ProcessQuery') > -1 &&
        opts.headers.authorization &&
        opts.headers.authorization.indexOf('Bearer ') === 0 &&
        opts.headers['X-RequestDigest'] &&
        opts.body === `<Request AddExpandoFieldTypeSuffix="true" SchemaVersion="15.0.0.0" LibraryVersion="16.0.0.0" ApplicationName="${config.applicationName}" xmlns="http://schemas.microsoft.com/sharepoint/clientquery/2009"><Actions><ObjectPath Id="55" ObjectPathId="54" /><ObjectIdentityQuery Id="56" ObjectPathId="54" /><ObjectPath Id="58" ObjectPathId="57" /><ObjectIdentityQuery Id="59" ObjectPathId="57" /><ObjectPath Id="61" ObjectPathId="60" /><ObjectPath Id="63" ObjectPathId="62" /><ObjectIdentityQuery Id="64" ObjectPathId="62" /><ObjectPath Id="66" ObjectPathId="65" /><ObjectPath Id="68" ObjectPathId="67" /><ObjectIdentityQuery Id="69" ObjectPathId="67" /><Query Id="70" ObjectPathId="67"><Query SelectAllProperties="true"><Properties><Property Name="Name" ScalarProperty="true" /><Property Name="Id" ScalarProperty="true" /></Properties></Query></Query></Actions><ObjectPaths><StaticMethod Id="54" Name="GetTaxonomySession" TypeId="{981cbc68-9edc-4f8d-872f-71146fcbb84f}" /><Method Id="57" ParentId="54" Name="GetDefaultSiteCollectionTermStore" /><Property Id="60" ParentId="57" Name="Groups" /><Method Id="62" ParentId="60" Name="GetById"><Parameters><Parameter Type="Guid">{0e8f395e-ff58-4d45-9ff7-e331ab728beb}</Parameter></Parameters></Method><Property Id="65" ParentId="62" Name="TermSets" /><Method Id="67" ParentId="65" Name="GetById"><Parameters><Parameter Type="Guid">{7a167c47-2b37-41d0-94d0-e962c1a4f2ed}</Parameter></Parameters></Method></ObjectPaths></Request>`) {
        return Promise.resolve(JSON.stringify([
          {
            "SchemaVersion": "15.0.0.0",
            "LibraryVersion": "16.0.8112.1218",
            "ErrorInfo": null,
            "TraceCorrelationId": "2994929e-20f1-0000-2cdb-e577d70db169"
          },
          55,
          {
            "IsNull": false
          },
          56,
          {
            "_ObjectIdentity_": "2994929e-20f1-0000-2cdb-e577d70db169|fec14c62-7c3b-481b-851b-c80d7802b224:ss:"
          },
          58,
          {
            "IsNull": false
          },
          59,
          {
            "_ObjectIdentity_": "2994929e-20f1-0000-2cdb-e577d70db169|fec14c62-7c3b-481b-851b-c80d7802b224:st:YU1+cBy9wUuh\u002ffzgFZGpUQ=="
          },
          61,
          {
            "IsNull": false
          },
          63,
          {
            "IsNull": false
          },
          64,
          {
            "_ObjectIdentity_": "2994929e-20f1-0000-2cdb-e577d70db169|fec14c62-7c3b-481b-851b-c80d7802b224:gr:YU1+cBy9wUuh\u002ffzgFZGpUV45jw5Y\u002f0VNn\u002ffjMatyi+s="
          },
          66,
          {
            "IsNull": false
          },
          68,
          {
            "IsNull": false
          },
          69,
          {
            "_ObjectIdentity_": "2994929e-20f1-0000-2cdb-e577d70db169|fec14c62-7c3b-481b-851b-c80d7802b224:se:YU1+cBy9wUuh\u002ffzgFZGpUV45jw5Y\u002f0VNn\u002ffjMatyi+tHfBZ6NyvQQZTQ6WLBpPLt"
          },
          70,
          {
            "_ObjectType_": "SP.Taxonomy.TermSet",
            "_ObjectIdentity_": "2994929e-20f1-0000-2cdb-e577d70db169|fec14c62-7c3b-481b-851b-c80d7802b224:se:YU1+cBy9wUuh\u002ffzgFZGpUV45jw5Y\u002f0VNn\u002ffjMatyi+tHfBZ6NyvQQZTQ6WLBpPLt",
            "CreatedDate": "\/Date(1536839573337)\/",
            "Id": "\/Guid(7a167c47-2b37-41d0-94d0-e962c1a4f2ed)\/",
            "LastModifiedDate": "\/Date(1536840826883)\/",
            "Name": "PnP-CollabFooter-SharedLinks",
            "CustomProperties": {
              "_Sys_Nav_IsNavigationTermSet": "True"
            },
            "CustomSortOrder": "a359ee29-cf72-4235-a4ef-1ed96bf4eaea:60d165e6-8cb1-4c20-8fad-80067c4ca767:da7bfb84-008b-48ff-b61f-bfe40da2602f",
            "IsAvailableForTagging": true,
            "Owner": "i:0#.f|membership|admin@contoso.onmicrosoft.com",
            "Contact": "",
            "Description": "",
            "IsOpenForTermCreation": false,
            "Names": {
              "1033": "PnP-CollabFooter-SharedLinks"
            },
            "Stakeholders": []
          }
        ]));
      }

      return Promise.reject('Invalid request');
    });
    auth.site = new Site();
    auth.site.connected = true;
    auth.site.url = 'https://contoso-admin.sharepoint.com';
    cmdInstance.action = command.action();
    cmdInstance.action({ options: { debug: false, id: '7a167c47-2b37-41d0-94d0-e962c1a4f2ed', termGroupId: '0e8f395e-ff58-4d45-9ff7-e331ab728beb' } }, () => {
      try {
        assert(cmdInstanceLogSpy.calledWith({
          "CreatedDate": "2018-09-13T11:52:53.337Z",
          "Id": "7a167c47-2b37-41d0-94d0-e962c1a4f2ed",
          "LastModifiedDate": "2018-09-13T12:13:46.883Z",
          "Name": "PnP-CollabFooter-SharedLinks",
          "CustomProperties": {
            "_Sys_Nav_IsNavigationTermSet": "True"
          },
          "CustomSortOrder": "a359ee29-cf72-4235-a4ef-1ed96bf4eaea:60d165e6-8cb1-4c20-8fad-80067c4ca767:da7bfb84-008b-48ff-b61f-bfe40da2602f",
          "IsAvailableForTagging": true,
          "Owner": "i:0#.f|membership|admin@contoso.onmicrosoft.com",
          "Contact": "",
          "Description": "",
          "IsOpenForTermCreation": false,
          "Names": {
            "1033": "PnP-CollabFooter-SharedLinks"
          },
          "Stakeholders": []
        }));
        done();
      }
      catch (e) {
        done(e);
      }
    });
  });

  it('gets taxonomy term set by name, term group by id (debug)', (done) => {
    sinon.stub(request, 'post').callsFake((opts) => {
      if (opts.url.indexOf('/_vti_bin/client.svc/ProcessQuery') > -1 &&
        opts.headers.authorization &&
        opts.headers.authorization.indexOf('Bearer ') === 0 &&
        opts.headers['X-RequestDigest'] &&
        opts.body === `<Request AddExpandoFieldTypeSuffix="true" SchemaVersion="15.0.0.0" LibraryVersion="16.0.0.0" ApplicationName="${config.applicationName}" xmlns="http://schemas.microsoft.com/sharepoint/clientquery/2009"><Actions><ObjectPath Id="55" ObjectPathId="54" /><ObjectIdentityQuery Id="56" ObjectPathId="54" /><ObjectPath Id="58" ObjectPathId="57" /><ObjectIdentityQuery Id="59" ObjectPathId="57" /><ObjectPath Id="61" ObjectPathId="60" /><ObjectPath Id="63" ObjectPathId="62" /><ObjectIdentityQuery Id="64" ObjectPathId="62" /><ObjectPath Id="66" ObjectPathId="65" /><ObjectPath Id="68" ObjectPathId="67" /><ObjectIdentityQuery Id="69" ObjectPathId="67" /><Query Id="70" ObjectPathId="67"><Query SelectAllProperties="true"><Properties><Property Name="Name" ScalarProperty="true" /><Property Name="Id" ScalarProperty="true" /></Properties></Query></Query></Actions><ObjectPaths><StaticMethod Id="54" Name="GetTaxonomySession" TypeId="{981cbc68-9edc-4f8d-872f-71146fcbb84f}" /><Method Id="57" ParentId="54" Name="GetDefaultSiteCollectionTermStore" /><Property Id="60" ParentId="57" Name="Groups" /><Method Id="62" ParentId="60" Name="GetById"><Parameters><Parameter Type="Guid">{0e8f395e-ff58-4d45-9ff7-e331ab728beb}</Parameter></Parameters></Method><Property Id="65" ParentId="62" Name="TermSets" /><Method Id="67" ParentId="65" Name="GetByName"><Parameters><Parameter Type="String">PnP-CollabFooter-SharedLinks</Parameter></Parameters></Method></ObjectPaths></Request>`) {
        return Promise.resolve(JSON.stringify([
          {
            "SchemaVersion": "15.0.0.0",
            "LibraryVersion": "16.0.8112.1218",
            "ErrorInfo": null,
            "TraceCorrelationId": "2994929e-20f1-0000-2cdb-e577d70db169"
          },
          55,
          {
            "IsNull": false
          },
          56,
          {
            "_ObjectIdentity_": "2994929e-20f1-0000-2cdb-e577d70db169|fec14c62-7c3b-481b-851b-c80d7802b224:ss:"
          },
          58,
          {
            "IsNull": false
          },
          59,
          {
            "_ObjectIdentity_": "2994929e-20f1-0000-2cdb-e577d70db169|fec14c62-7c3b-481b-851b-c80d7802b224:st:YU1+cBy9wUuh\u002ffzgFZGpUQ=="
          },
          61,
          {
            "IsNull": false
          },
          63,
          {
            "IsNull": false
          },
          64,
          {
            "_ObjectIdentity_": "2994929e-20f1-0000-2cdb-e577d70db169|fec14c62-7c3b-481b-851b-c80d7802b224:gr:YU1+cBy9wUuh\u002ffzgFZGpUV45jw5Y\u002f0VNn\u002ffjMatyi+s="
          },
          66,
          {
            "IsNull": false
          },
          68,
          {
            "IsNull": false
          },
          69,
          {
            "_ObjectIdentity_": "2994929e-20f1-0000-2cdb-e577d70db169|fec14c62-7c3b-481b-851b-c80d7802b224:se:YU1+cBy9wUuh\u002ffzgFZGpUV45jw5Y\u002f0VNn\u002ffjMatyi+tHfBZ6NyvQQZTQ6WLBpPLt"
          },
          70,
          {
            "_ObjectType_": "SP.Taxonomy.TermSet",
            "_ObjectIdentity_": "2994929e-20f1-0000-2cdb-e577d70db169|fec14c62-7c3b-481b-851b-c80d7802b224:se:YU1+cBy9wUuh\u002ffzgFZGpUV45jw5Y\u002f0VNn\u002ffjMatyi+tHfBZ6NyvQQZTQ6WLBpPLt",
            "CreatedDate": "\/Date(1536839573337)\/",
            "Id": "\/Guid(7a167c47-2b37-41d0-94d0-e962c1a4f2ed)\/",
            "LastModifiedDate": "\/Date(1536840826883)\/",
            "Name": "PnP-CollabFooter-SharedLinks",
            "CustomProperties": {
              "_Sys_Nav_IsNavigationTermSet": "True"
            },
            "CustomSortOrder": "a359ee29-cf72-4235-a4ef-1ed96bf4eaea:60d165e6-8cb1-4c20-8fad-80067c4ca767:da7bfb84-008b-48ff-b61f-bfe40da2602f",
            "IsAvailableForTagging": true,
            "Owner": "i:0#.f|membership|admin@contoso.onmicrosoft.com",
            "Contact": "",
            "Description": "",
            "IsOpenForTermCreation": false,
            "Names": {
              "1033": "PnP-CollabFooter-SharedLinks"
            },
            "Stakeholders": []
          }
        ]));
      }

      return Promise.reject('Invalid request');
    });
    auth.site = new Site();
    auth.site.connected = true;
    auth.site.url = 'https://contoso-admin.sharepoint.com';
    cmdInstance.action = command.action();
    cmdInstance.action({ options: { debug: true, name: 'PnP-CollabFooter-SharedLinks', termGroupId: '0e8f395e-ff58-4d45-9ff7-e331ab728beb' } }, () => {
      try {
        assert(cmdInstanceLogSpy.calledWith({
          "CreatedDate": "2018-09-13T11:52:53.337Z",
          "Id": "7a167c47-2b37-41d0-94d0-e962c1a4f2ed",
          "LastModifiedDate": "2018-09-13T12:13:46.883Z",
          "Name": "PnP-CollabFooter-SharedLinks",
          "CustomProperties": {
            "_Sys_Nav_IsNavigationTermSet": "True"
          },
          "CustomSortOrder": "a359ee29-cf72-4235-a4ef-1ed96bf4eaea:60d165e6-8cb1-4c20-8fad-80067c4ca767:da7bfb84-008b-48ff-b61f-bfe40da2602f",
          "IsAvailableForTagging": true,
          "Owner": "i:0#.f|membership|admin@contoso.onmicrosoft.com",
          "Contact": "",
          "Description": "",
          "IsOpenForTermCreation": false,
          "Names": {
            "1033": "PnP-CollabFooter-SharedLinks"
          },
          "Stakeholders": []
        }));
        done();
      }
      catch (e) {
        done(e);
      }
    });
  });

  it('gets taxonomy term set by id, term group by name', (done) => {
    sinon.stub(request, 'post').callsFake((opts) => {
      if (opts.url.indexOf('/_vti_bin/client.svc/ProcessQuery') > -1 &&
        opts.headers.authorization &&
        opts.headers.authorization.indexOf('Bearer ') === 0 &&
        opts.headers['X-RequestDigest'] &&
        opts.body === `<Request AddExpandoFieldTypeSuffix="true" SchemaVersion="15.0.0.0" LibraryVersion="16.0.0.0" ApplicationName="${config.applicationName}" xmlns="http://schemas.microsoft.com/sharepoint/clientquery/2009"><Actions><ObjectPath Id="55" ObjectPathId="54" /><ObjectIdentityQuery Id="56" ObjectPathId="54" /><ObjectPath Id="58" ObjectPathId="57" /><ObjectIdentityQuery Id="59" ObjectPathId="57" /><ObjectPath Id="61" ObjectPathId="60" /><ObjectPath Id="63" ObjectPathId="62" /><ObjectIdentityQuery Id="64" ObjectPathId="62" /><ObjectPath Id="66" ObjectPathId="65" /><ObjectPath Id="68" ObjectPathId="67" /><ObjectIdentityQuery Id="69" ObjectPathId="67" /><Query Id="70" ObjectPathId="67"><Query SelectAllProperties="true"><Properties><Property Name="Name" ScalarProperty="true" /><Property Name="Id" ScalarProperty="true" /></Properties></Query></Query></Actions><ObjectPaths><StaticMethod Id="54" Name="GetTaxonomySession" TypeId="{981cbc68-9edc-4f8d-872f-71146fcbb84f}" /><Method Id="57" ParentId="54" Name="GetDefaultSiteCollectionTermStore" /><Property Id="60" ParentId="57" Name="Groups" /><Method Id="62" ParentId="60" Name="GetByName"><Parameters><Parameter Type="String">PnPTermSets</Parameter></Parameters></Method><Property Id="65" ParentId="62" Name="TermSets" /><Method Id="67" ParentId="65" Name="GetById"><Parameters><Parameter Type="Guid">{7a167c47-2b37-41d0-94d0-e962c1a4f2ed}</Parameter></Parameters></Method></ObjectPaths></Request>`) {
        return Promise.resolve(JSON.stringify([
          {
            "SchemaVersion": "15.0.0.0",
            "LibraryVersion": "16.0.8112.1218",
            "ErrorInfo": null,
            "TraceCorrelationId": "2994929e-20f1-0000-2cdb-e577d70db169"
          },
          55,
          {
            "IsNull": false
          },
          56,
          {
            "_ObjectIdentity_": "2994929e-20f1-0000-2cdb-e577d70db169|fec14c62-7c3b-481b-851b-c80d7802b224:ss:"
          },
          58,
          {
            "IsNull": false
          },
          59,
          {
            "_ObjectIdentity_": "2994929e-20f1-0000-2cdb-e577d70db169|fec14c62-7c3b-481b-851b-c80d7802b224:st:YU1+cBy9wUuh\u002ffzgFZGpUQ=="
          },
          61,
          {
            "IsNull": false
          },
          63,
          {
            "IsNull": false
          },
          64,
          {
            "_ObjectIdentity_": "2994929e-20f1-0000-2cdb-e577d70db169|fec14c62-7c3b-481b-851b-c80d7802b224:gr:YU1+cBy9wUuh\u002ffzgFZGpUV45jw5Y\u002f0VNn\u002ffjMatyi+s="
          },
          66,
          {
            "IsNull": false
          },
          68,
          {
            "IsNull": false
          },
          69,
          {
            "_ObjectIdentity_": "2994929e-20f1-0000-2cdb-e577d70db169|fec14c62-7c3b-481b-851b-c80d7802b224:se:YU1+cBy9wUuh\u002ffzgFZGpUV45jw5Y\u002f0VNn\u002ffjMatyi+tHfBZ6NyvQQZTQ6WLBpPLt"
          },
          70,
          {
            "_ObjectType_": "SP.Taxonomy.TermSet",
            "_ObjectIdentity_": "2994929e-20f1-0000-2cdb-e577d70db169|fec14c62-7c3b-481b-851b-c80d7802b224:se:YU1+cBy9wUuh\u002ffzgFZGpUV45jw5Y\u002f0VNn\u002ffjMatyi+tHfBZ6NyvQQZTQ6WLBpPLt",
            "CreatedDate": "\/Date(1536839573337)\/",
            "Id": "\/Guid(7a167c47-2b37-41d0-94d0-e962c1a4f2ed)\/",
            "LastModifiedDate": "\/Date(1536840826883)\/",
            "Name": "PnP-CollabFooter-SharedLinks",
            "CustomProperties": {
              "_Sys_Nav_IsNavigationTermSet": "True"
            },
            "CustomSortOrder": "a359ee29-cf72-4235-a4ef-1ed96bf4eaea:60d165e6-8cb1-4c20-8fad-80067c4ca767:da7bfb84-008b-48ff-b61f-bfe40da2602f",
            "IsAvailableForTagging": true,
            "Owner": "i:0#.f|membership|admin@contoso.onmicrosoft.com",
            "Contact": "",
            "Description": "",
            "IsOpenForTermCreation": false,
            "Names": {
              "1033": "PnP-CollabFooter-SharedLinks"
            },
            "Stakeholders": []
          }
        ]));
      }

      return Promise.reject('Invalid request');
    });
    auth.site = new Site();
    auth.site.connected = true;
    auth.site.url = 'https://contoso-admin.sharepoint.com';
    cmdInstance.action = command.action();
    cmdInstance.action({ options: { debug: false, id: '7a167c47-2b37-41d0-94d0-e962c1a4f2ed', termGroupName: 'PnPTermSets' } }, () => {
      try {
        assert(cmdInstanceLogSpy.calledWith({
          "CreatedDate": "2018-09-13T11:52:53.337Z",
          "Id": "7a167c47-2b37-41d0-94d0-e962c1a4f2ed",
          "LastModifiedDate": "2018-09-13T12:13:46.883Z",
          "Name": "PnP-CollabFooter-SharedLinks",
          "CustomProperties": {
            "_Sys_Nav_IsNavigationTermSet": "True"
          },
          "CustomSortOrder": "a359ee29-cf72-4235-a4ef-1ed96bf4eaea:60d165e6-8cb1-4c20-8fad-80067c4ca767:da7bfb84-008b-48ff-b61f-bfe40da2602f",
          "IsAvailableForTagging": true,
          "Owner": "i:0#.f|membership|admin@contoso.onmicrosoft.com",
          "Contact": "",
          "Description": "",
          "IsOpenForTermCreation": false,
          "Names": {
            "1033": "PnP-CollabFooter-SharedLinks"
          },
          "Stakeholders": []
        }));
        done();
      }
      catch (e) {
        done(e);
      }
    });
  });

  it('gets taxonomy term set by name, term group by name', (done) => {
    sinon.stub(request, 'post').callsFake((opts) => {
      if (opts.url.indexOf('/_vti_bin/client.svc/ProcessQuery') > -1 &&
        opts.headers.authorization &&
        opts.headers.authorization.indexOf('Bearer ') === 0 &&
        opts.headers['X-RequestDigest'] &&
        opts.body === `<Request AddExpandoFieldTypeSuffix="true" SchemaVersion="15.0.0.0" LibraryVersion="16.0.0.0" ApplicationName="${config.applicationName}" xmlns="http://schemas.microsoft.com/sharepoint/clientquery/2009"><Actions><ObjectPath Id="55" ObjectPathId="54" /><ObjectIdentityQuery Id="56" ObjectPathId="54" /><ObjectPath Id="58" ObjectPathId="57" /><ObjectIdentityQuery Id="59" ObjectPathId="57" /><ObjectPath Id="61" ObjectPathId="60" /><ObjectPath Id="63" ObjectPathId="62" /><ObjectIdentityQuery Id="64" ObjectPathId="62" /><ObjectPath Id="66" ObjectPathId="65" /><ObjectPath Id="68" ObjectPathId="67" /><ObjectIdentityQuery Id="69" ObjectPathId="67" /><Query Id="70" ObjectPathId="67"><Query SelectAllProperties="true"><Properties><Property Name="Name" ScalarProperty="true" /><Property Name="Id" ScalarProperty="true" /></Properties></Query></Query></Actions><ObjectPaths><StaticMethod Id="54" Name="GetTaxonomySession" TypeId="{981cbc68-9edc-4f8d-872f-71146fcbb84f}" /><Method Id="57" ParentId="54" Name="GetDefaultSiteCollectionTermStore" /><Property Id="60" ParentId="57" Name="Groups" /><Method Id="62" ParentId="60" Name="GetByName"><Parameters><Parameter Type="String">PnPTermSets</Parameter></Parameters></Method><Property Id="65" ParentId="62" Name="TermSets" /><Method Id="67" ParentId="65" Name="GetByName"><Parameters><Parameter Type="String">PnP-CollabFooter-SharedLinks</Parameter></Parameters></Method></ObjectPaths></Request>`) {
        return Promise.resolve(JSON.stringify([
          {
            "SchemaVersion": "15.0.0.0",
            "LibraryVersion": "16.0.8112.1218",
            "ErrorInfo": null,
            "TraceCorrelationId": "2994929e-20f1-0000-2cdb-e577d70db169"
          },
          55,
          {
            "IsNull": false
          },
          56,
          {
            "_ObjectIdentity_": "2994929e-20f1-0000-2cdb-e577d70db169|fec14c62-7c3b-481b-851b-c80d7802b224:ss:"
          },
          58,
          {
            "IsNull": false
          },
          59,
          {
            "_ObjectIdentity_": "2994929e-20f1-0000-2cdb-e577d70db169|fec14c62-7c3b-481b-851b-c80d7802b224:st:YU1+cBy9wUuh\u002ffzgFZGpUQ=="
          },
          61,
          {
            "IsNull": false
          },
          63,
          {
            "IsNull": false
          },
          64,
          {
            "_ObjectIdentity_": "2994929e-20f1-0000-2cdb-e577d70db169|fec14c62-7c3b-481b-851b-c80d7802b224:gr:YU1+cBy9wUuh\u002ffzgFZGpUV45jw5Y\u002f0VNn\u002ffjMatyi+s="
          },
          66,
          {
            "IsNull": false
          },
          68,
          {
            "IsNull": false
          },
          69,
          {
            "_ObjectIdentity_": "2994929e-20f1-0000-2cdb-e577d70db169|fec14c62-7c3b-481b-851b-c80d7802b224:se:YU1+cBy9wUuh\u002ffzgFZGpUV45jw5Y\u002f0VNn\u002ffjMatyi+tHfBZ6NyvQQZTQ6WLBpPLt"
          },
          70,
          {
            "_ObjectType_": "SP.Taxonomy.TermSet",
            "_ObjectIdentity_": "2994929e-20f1-0000-2cdb-e577d70db169|fec14c62-7c3b-481b-851b-c80d7802b224:se:YU1+cBy9wUuh\u002ffzgFZGpUV45jw5Y\u002f0VNn\u002ffjMatyi+tHfBZ6NyvQQZTQ6WLBpPLt",
            "CreatedDate": "\/Date(1536839573337)\/",
            "Id": "\/Guid(7a167c47-2b37-41d0-94d0-e962c1a4f2ed)\/",
            "LastModifiedDate": "\/Date(1536840826883)\/",
            "Name": "PnP-CollabFooter-SharedLinks",
            "CustomProperties": {
              "_Sys_Nav_IsNavigationTermSet": "True"
            },
            "CustomSortOrder": "a359ee29-cf72-4235-a4ef-1ed96bf4eaea:60d165e6-8cb1-4c20-8fad-80067c4ca767:da7bfb84-008b-48ff-b61f-bfe40da2602f",
            "IsAvailableForTagging": true,
            "Owner": "i:0#.f|membership|admin@contoso.onmicrosoft.com",
            "Contact": "",
            "Description": "",
            "IsOpenForTermCreation": false,
            "Names": {
              "1033": "PnP-CollabFooter-SharedLinks"
            },
            "Stakeholders": []
          }
        ]));
      }

      return Promise.reject('Invalid request');
    });
    auth.site = new Site();
    auth.site.connected = true;
    auth.site.url = 'https://contoso-admin.sharepoint.com';
    cmdInstance.action = command.action();
    cmdInstance.action({ options: { debug: false, name: 'PnP-CollabFooter-SharedLinks', termGroupName: 'PnPTermSets' } }, () => {
      try {
        assert(cmdInstanceLogSpy.calledWith({
          "CreatedDate": "2018-09-13T11:52:53.337Z",
          "Id": "7a167c47-2b37-41d0-94d0-e962c1a4f2ed",
          "LastModifiedDate": "2018-09-13T12:13:46.883Z",
          "Name": "PnP-CollabFooter-SharedLinks",
          "CustomProperties": {
            "_Sys_Nav_IsNavigationTermSet": "True"
          },
          "CustomSortOrder": "a359ee29-cf72-4235-a4ef-1ed96bf4eaea:60d165e6-8cb1-4c20-8fad-80067c4ca767:da7bfb84-008b-48ff-b61f-bfe40da2602f",
          "IsAvailableForTagging": true,
          "Owner": "i:0#.f|membership|admin@contoso.onmicrosoft.com",
          "Contact": "",
          "Description": "",
          "IsOpenForTermCreation": false,
          "Names": {
            "1033": "PnP-CollabFooter-SharedLinks"
          },
          "Stakeholders": []
        }));
        done();
      }
      catch (e) {
        done(e);
      }
    });
  });

  it('escapes XML in term group name', (done) => {
    sinon.stub(request, 'post').callsFake((opts) => {
      if (opts.url.indexOf('/_vti_bin/client.svc/ProcessQuery') > -1 &&
        opts.headers.authorization &&
        opts.headers.authorization.indexOf('Bearer ') === 0 &&
        opts.headers['X-RequestDigest'] &&
        opts.body === `<Request AddExpandoFieldTypeSuffix="true" SchemaVersion="15.0.0.0" LibraryVersion="16.0.0.0" ApplicationName="${config.applicationName}" xmlns="http://schemas.microsoft.com/sharepoint/clientquery/2009"><Actions><ObjectPath Id="55" ObjectPathId="54" /><ObjectIdentityQuery Id="56" ObjectPathId="54" /><ObjectPath Id="58" ObjectPathId="57" /><ObjectIdentityQuery Id="59" ObjectPathId="57" /><ObjectPath Id="61" ObjectPathId="60" /><ObjectPath Id="63" ObjectPathId="62" /><ObjectIdentityQuery Id="64" ObjectPathId="62" /><ObjectPath Id="66" ObjectPathId="65" /><ObjectPath Id="68" ObjectPathId="67" /><ObjectIdentityQuery Id="69" ObjectPathId="67" /><Query Id="70" ObjectPathId="67"><Query SelectAllProperties="true"><Properties><Property Name="Name" ScalarProperty="true" /><Property Name="Id" ScalarProperty="true" /></Properties></Query></Query></Actions><ObjectPaths><StaticMethod Id="54" Name="GetTaxonomySession" TypeId="{981cbc68-9edc-4f8d-872f-71146fcbb84f}" /><Method Id="57" ParentId="54" Name="GetDefaultSiteCollectionTermStore" /><Property Id="60" ParentId="57" Name="Groups" /><Method Id="62" ParentId="60" Name="GetByName"><Parameters><Parameter Type="String">PnPTermSets&gt;</Parameter></Parameters></Method><Property Id="65" ParentId="62" Name="TermSets" /><Method Id="67" ParentId="65" Name="GetByName"><Parameters><Parameter Type="String">PnP-CollabFooter-SharedLinks</Parameter></Parameters></Method></ObjectPaths></Request>`) {
        return Promise.resolve(JSON.stringify([
          {
            "SchemaVersion": "15.0.0.0",
            "LibraryVersion": "16.0.8112.1218",
            "ErrorInfo": null,
            "TraceCorrelationId": "2994929e-20f1-0000-2cdb-e577d70db169"
          },
          55,
          {
            "IsNull": false
          },
          56,
          {
            "_ObjectIdentity_": "2994929e-20f1-0000-2cdb-e577d70db169|fec14c62-7c3b-481b-851b-c80d7802b224:ss:"
          },
          58,
          {
            "IsNull": false
          },
          59,
          {
            "_ObjectIdentity_": "2994929e-20f1-0000-2cdb-e577d70db169|fec14c62-7c3b-481b-851b-c80d7802b224:st:YU1+cBy9wUuh\u002ffzgFZGpUQ=="
          },
          61,
          {
            "IsNull": false
          },
          63,
          {
            "IsNull": false
          },
          64,
          {
            "_ObjectIdentity_": "2994929e-20f1-0000-2cdb-e577d70db169|fec14c62-7c3b-481b-851b-c80d7802b224:gr:YU1+cBy9wUuh\u002ffzgFZGpUV45jw5Y\u002f0VNn\u002ffjMatyi+s="
          },
          66,
          {
            "IsNull": false
          },
          68,
          {
            "IsNull": false
          },
          69,
          {
            "_ObjectIdentity_": "2994929e-20f1-0000-2cdb-e577d70db169|fec14c62-7c3b-481b-851b-c80d7802b224:se:YU1+cBy9wUuh\u002ffzgFZGpUV45jw5Y\u002f0VNn\u002ffjMatyi+tHfBZ6NyvQQZTQ6WLBpPLt"
          },
          70,
          {
            "_ObjectType_": "SP.Taxonomy.TermSet",
            "_ObjectIdentity_": "2994929e-20f1-0000-2cdb-e577d70db169|fec14c62-7c3b-481b-851b-c80d7802b224:se:YU1+cBy9wUuh\u002ffzgFZGpUV45jw5Y\u002f0VNn\u002ffjMatyi+tHfBZ6NyvQQZTQ6WLBpPLt",
            "CreatedDate": "\/Date(1536839573337)\/",
            "Id": "\/Guid(7a167c47-2b37-41d0-94d0-e962c1a4f2ed)\/",
            "LastModifiedDate": "\/Date(1536840826883)\/",
            "Name": "PnP-CollabFooter-SharedLinks",
            "CustomProperties": {
              "_Sys_Nav_IsNavigationTermSet": "True"
            },
            "CustomSortOrder": "a359ee29-cf72-4235-a4ef-1ed96bf4eaea:60d165e6-8cb1-4c20-8fad-80067c4ca767:da7bfb84-008b-48ff-b61f-bfe40da2602f",
            "IsAvailableForTagging": true,
            "Owner": "i:0#.f|membership|admin@contoso.onmicrosoft.com",
            "Contact": "",
            "Description": "",
            "IsOpenForTermCreation": false,
            "Names": {
              "1033": "PnP-CollabFooter-SharedLinks"
            },
            "Stakeholders": []
          }
        ]));
      }

      return Promise.reject('Invalid request');
    });
    auth.site = new Site();
    auth.site.connected = true;
    auth.site.url = 'https://contoso-admin.sharepoint.com';
    cmdInstance.action = command.action();
    cmdInstance.action({ options: { debug: false, name: 'PnP-CollabFooter-SharedLinks', termGroupName: 'PnPTermSets>' } }, () => {
      try {
        assert(cmdInstanceLogSpy.calledWith({
          "CreatedDate": "2018-09-13T11:52:53.337Z",
          "Id": "7a167c47-2b37-41d0-94d0-e962c1a4f2ed",
          "LastModifiedDate": "2018-09-13T12:13:46.883Z",
          "Name": "PnP-CollabFooter-SharedLinks",
          "CustomProperties": {
            "_Sys_Nav_IsNavigationTermSet": "True"
          },
          "CustomSortOrder": "a359ee29-cf72-4235-a4ef-1ed96bf4eaea:60d165e6-8cb1-4c20-8fad-80067c4ca767:da7bfb84-008b-48ff-b61f-bfe40da2602f",
          "IsAvailableForTagging": true,
          "Owner": "i:0#.f|membership|admin@contoso.onmicrosoft.com",
          "Contact": "",
          "Description": "",
          "IsOpenForTermCreation": false,
          "Names": {
            "1033": "PnP-CollabFooter-SharedLinks"
          },
          "Stakeholders": []
        }));
        done();
      }
      catch (e) {
        done(e);
      }
    });
  });

  it('escapes XML in term set name', (done) => {
    sinon.stub(request, 'post').callsFake((opts) => {
      if (opts.url.indexOf('/_vti_bin/client.svc/ProcessQuery') > -1 &&
        opts.headers.authorization &&
        opts.headers.authorization.indexOf('Bearer ') === 0 &&
        opts.headers['X-RequestDigest'] &&
        opts.body === `<Request AddExpandoFieldTypeSuffix="true" SchemaVersion="15.0.0.0" LibraryVersion="16.0.0.0" ApplicationName="${config.applicationName}" xmlns="http://schemas.microsoft.com/sharepoint/clientquery/2009"><Actions><ObjectPath Id="55" ObjectPathId="54" /><ObjectIdentityQuery Id="56" ObjectPathId="54" /><ObjectPath Id="58" ObjectPathId="57" /><ObjectIdentityQuery Id="59" ObjectPathId="57" /><ObjectPath Id="61" ObjectPathId="60" /><ObjectPath Id="63" ObjectPathId="62" /><ObjectIdentityQuery Id="64" ObjectPathId="62" /><ObjectPath Id="66" ObjectPathId="65" /><ObjectPath Id="68" ObjectPathId="67" /><ObjectIdentityQuery Id="69" ObjectPathId="67" /><Query Id="70" ObjectPathId="67"><Query SelectAllProperties="true"><Properties><Property Name="Name" ScalarProperty="true" /><Property Name="Id" ScalarProperty="true" /></Properties></Query></Query></Actions><ObjectPaths><StaticMethod Id="54" Name="GetTaxonomySession" TypeId="{981cbc68-9edc-4f8d-872f-71146fcbb84f}" /><Method Id="57" ParentId="54" Name="GetDefaultSiteCollectionTermStore" /><Property Id="60" ParentId="57" Name="Groups" /><Method Id="62" ParentId="60" Name="GetByName"><Parameters><Parameter Type="String">PnPTermSets</Parameter></Parameters></Method><Property Id="65" ParentId="62" Name="TermSets" /><Method Id="67" ParentId="65" Name="GetByName"><Parameters><Parameter Type="String">PnP-CollabFooter-SharedLinks&gt;</Parameter></Parameters></Method></ObjectPaths></Request>`) {
        return Promise.resolve(JSON.stringify([
          {
            "SchemaVersion": "15.0.0.0",
            "LibraryVersion": "16.0.8112.1218",
            "ErrorInfo": null,
            "TraceCorrelationId": "2994929e-20f1-0000-2cdb-e577d70db169"
          },
          55,
          {
            "IsNull": false
          },
          56,
          {
            "_ObjectIdentity_": "2994929e-20f1-0000-2cdb-e577d70db169|fec14c62-7c3b-481b-851b-c80d7802b224:ss:"
          },
          58,
          {
            "IsNull": false
          },
          59,
          {
            "_ObjectIdentity_": "2994929e-20f1-0000-2cdb-e577d70db169|fec14c62-7c3b-481b-851b-c80d7802b224:st:YU1+cBy9wUuh\u002ffzgFZGpUQ=="
          },
          61,
          {
            "IsNull": false
          },
          63,
          {
            "IsNull": false
          },
          64,
          {
            "_ObjectIdentity_": "2994929e-20f1-0000-2cdb-e577d70db169|fec14c62-7c3b-481b-851b-c80d7802b224:gr:YU1+cBy9wUuh\u002ffzgFZGpUV45jw5Y\u002f0VNn\u002ffjMatyi+s="
          },
          66,
          {
            "IsNull": false
          },
          68,
          {
            "IsNull": false
          },
          69,
          {
            "_ObjectIdentity_": "2994929e-20f1-0000-2cdb-e577d70db169|fec14c62-7c3b-481b-851b-c80d7802b224:se:YU1+cBy9wUuh\u002ffzgFZGpUV45jw5Y\u002f0VNn\u002ffjMatyi+tHfBZ6NyvQQZTQ6WLBpPLt"
          },
          70,
          {
            "_ObjectType_": "SP.Taxonomy.TermSet",
            "_ObjectIdentity_": "2994929e-20f1-0000-2cdb-e577d70db169|fec14c62-7c3b-481b-851b-c80d7802b224:se:YU1+cBy9wUuh\u002ffzgFZGpUV45jw5Y\u002f0VNn\u002ffjMatyi+tHfBZ6NyvQQZTQ6WLBpPLt",
            "CreatedDate": "\/Date(1536839573337)\/",
            "Id": "\/Guid(7a167c47-2b37-41d0-94d0-e962c1a4f2ed)\/",
            "LastModifiedDate": "\/Date(1536840826883)\/",
            "Name": "PnP-CollabFooter-SharedLinks",
            "CustomProperties": {
              "_Sys_Nav_IsNavigationTermSet": "True"
            },
            "CustomSortOrder": "a359ee29-cf72-4235-a4ef-1ed96bf4eaea:60d165e6-8cb1-4c20-8fad-80067c4ca767:da7bfb84-008b-48ff-b61f-bfe40da2602f",
            "IsAvailableForTagging": true,
            "Owner": "i:0#.f|membership|admin@contoso.onmicrosoft.com",
            "Contact": "",
            "Description": "",
            "IsOpenForTermCreation": false,
            "Names": {
              "1033": "PnP-CollabFooter-SharedLinks>"
            },
            "Stakeholders": []
          }
        ]));
      }

      return Promise.reject('Invalid request');
    });
    auth.site = new Site();
    auth.site.connected = true;
    auth.site.url = 'https://contoso-admin.sharepoint.com';
    cmdInstance.action = command.action();
    cmdInstance.action({ options: { debug: false, name: 'PnP-CollabFooter-SharedLinks>', termGroupName: 'PnPTermSets' } }, () => {
      try {
        assert(cmdInstanceLogSpy.calledWith({
          "CreatedDate": "2018-09-13T11:52:53.337Z",
          "Id": "7a167c47-2b37-41d0-94d0-e962c1a4f2ed",
          "LastModifiedDate": "2018-09-13T12:13:46.883Z",
          "Name": "PnP-CollabFooter-SharedLinks",
          "CustomProperties": {
            "_Sys_Nav_IsNavigationTermSet": "True"
          },
          "CustomSortOrder": "a359ee29-cf72-4235-a4ef-1ed96bf4eaea:60d165e6-8cb1-4c20-8fad-80067c4ca767:da7bfb84-008b-48ff-b61f-bfe40da2602f",
          "IsAvailableForTagging": true,
          "Owner": "i:0#.f|membership|admin@contoso.onmicrosoft.com",
          "Contact": "",
          "Description": "",
          "IsOpenForTermCreation": false,
          "Names": {
            "1033": "PnP-CollabFooter-SharedLinks>"
          },
          "Stakeholders": []
        }));
        done();
      }
      catch (e) {
        done(e);
      }
    });
  });

  it('correctly handles term group not found via id', (done) => {
    sinon.stub(request, 'post').callsFake((opts) => {
      return Promise.resolve(JSON.stringify([
        {
          "SchemaVersion": "15.0.0.0", "LibraryVersion": "16.0.8112.1218", "ErrorInfo": {
            "ErrorMessage": "Specified argument was out of the range of valid values.\r\nParameter name: index", "ErrorValue": null, "TraceCorrelationId": "8092929e-e06a-0000-2cdb-e217ce4a986e", "ErrorCode": -2146233086, "ErrorTypeName": "System.ArgumentOutOfRangeException"
          }, "TraceCorrelationId": "8092929e-e06a-0000-2cdb-e217ce4a986e"
        }
      ]));
    });
    auth.site = new Site();
    auth.site.connected = true;
    auth.site.url = 'https://contoso-admin.sharepoint.com';
    cmdInstance.action = command.action();
    cmdInstance.action({ options: { debug: false, id: '7a167c47-2b37-41d0-94d0-e962c1a4f2ed', termGroupId: '0e8f395e-ff58-4d45-9ff7-e331ab728beb' } }, (err?: any) => {
      try {
        assert.equal(JSON.stringify(err), JSON.stringify(new CommandError('Specified argument was out of the range of valid values.\r\nParameter name: index')));
        done();
      }
      catch (e) {
        done(e);
      }
    });
  });

  it('correctly handles term group not found via name', (done) => {
    sinon.stub(request, 'post').callsFake((opts) => {
      return Promise.resolve(JSON.stringify([
        {
          "SchemaVersion": "15.0.0.0", "LibraryVersion": "16.0.8112.1218", "ErrorInfo": {
            "ErrorMessage": "Specified argument was out of the range of valid values.\r\nParameter name: index", "ErrorValue": null, "TraceCorrelationId": "7992929e-a0f1-0000-2cdb-e3c8b27b1f34", "ErrorCode": -2146233086, "ErrorTypeName": "System.ArgumentOutOfRangeException"
          }, "TraceCorrelationId": "7992929e-a0f1-0000-2cdb-e3c8b27b1f34"
        }
      ]));
    });
    auth.site = new Site();
    auth.site.connected = true;
    auth.site.url = 'https://contoso-admin.sharepoint.com';
    cmdInstance.action = command.action();
    cmdInstance.action({ options: { debug: false, name: 'PnP-CollabFooter-SharedLinks', termGroupName: 'PnPTermSets' } }, (err?: any) => {
      try {
        assert.equal(JSON.stringify(err), JSON.stringify(new CommandError('Specified argument was out of the range of valid values.\r\nParameter name: index')));
        done();
      }
      catch (e) {
        done(e);
      }
    });
  });

  it('correctly handles term set not found via id', (done) => {
    sinon.stub(request, 'post').callsFake((opts) => {
      return Promise.resolve(JSON.stringify([
        {
          "SchemaVersion": "15.0.0.0", "LibraryVersion": "16.0.8112.1218", "ErrorInfo": {
            "ErrorMessage": "Specified argument was out of the range of valid values.\r\nParameter name: index", "ErrorValue": null, "TraceCorrelationId": "7192929e-70ad-0000-2cdb-e0f1f8d0326d", "ErrorCode": -2146233086, "ErrorTypeName": "System.ArgumentOutOfRangeException"
          }, "TraceCorrelationId": "7192929e-70ad-0000-2cdb-e0f1f8d0326d"
        }
      ]));
    });
    auth.site = new Site();
    auth.site.connected = true;
    auth.site.url = 'https://contoso-admin.sharepoint.com';
    cmdInstance.action = command.action();
    cmdInstance.action({ options: { debug: false, id: '7a167c47-2b37-41d0-94d0-e962c1a4f2ed', termGroupId: '0e8f395e-ff58-4d45-9ff7-e331ab728beb' } }, (err?: any) => {
      try {
        assert.equal(JSON.stringify(err), JSON.stringify(new CommandError('Specified argument was out of the range of valid values.\r\nParameter name: index')));
        done();
      }
      catch (e) {
        done(e);
      }
    });
  });

  it('correctly handles term set not found via name', (done) => {
    sinon.stub(request, 'post').callsFake((opts) => {
      return Promise.resolve(JSON.stringify([
        {
          "SchemaVersion": "15.0.0.0", "LibraryVersion": "16.0.8112.1218", "ErrorInfo": {
            "ErrorMessage": "Specified argument was out of the range of valid values.\r\nParameter name: index", "ErrorValue": null, "TraceCorrelationId": "7992929e-a0f1-0000-2cdb-e3c8b27b1f34", "ErrorCode": -2146233086, "ErrorTypeName": "System.ArgumentOutOfRangeException"
          }, "TraceCorrelationId": "7992929e-a0f1-0000-2cdb-e3c8b27b1f34"
        }
      ]));
    });
    auth.site = new Site();
    auth.site.connected = true;
    auth.site.url = 'https://contoso-admin.sharepoint.com';
    cmdInstance.action = command.action();
    cmdInstance.action({ options: { debug: false, name: 'PnP-CollabFooter-SharedLinks', termGroupName: 'PnPTermSets' } }, (err?: any) => {
      try {
        assert.equal(JSON.stringify(err), JSON.stringify(new CommandError('Specified argument was out of the range of valid values.\r\nParameter name: index')));
        done();
      }
      catch (e) {
        done(e);
      }
    });
  });

  it('correctly handles error when retrieving taxonomy term set', (done) => {
    sinon.stub(request, 'post').callsFake((opts) => {
      return Promise.resolve(JSON.stringify([
        {
          "SchemaVersion": "15.0.0.0", "LibraryVersion": "16.0.7018.1204", "ErrorInfo": {
            "ErrorMessage": "File Not Found.", "ErrorValue": null, "TraceCorrelationId": "9e54299e-208a-4000-8546-cc4139091b26", "ErrorCode": -2147024894, "ErrorTypeName": "System.IO.FileNotFoundException"
          }, "TraceCorrelationId": "9e54299e-208a-4000-8546-cc4139091b26"
        }
      ]));
    });
    auth.site = new Site();
    auth.site.connected = true;
    auth.site.url = 'https://contoso-admin.sharepoint.com';
    cmdInstance.action = command.action();
    cmdInstance.action({ options: { debug: false } }, (err?: any) => {
      try {
        assert.equal(JSON.stringify(err), JSON.stringify(new CommandError('File Not Found.')));
        done();
      }
      catch (e) {
        done(e);
      }
    });
  });

  it('fails validation if neither id nor name specified', () => {
    const actual = (command.validate() as CommandValidate)({ options: { termGroupName: 'PnPTermSets' } });
    assert.notEqual(actual, true);
  });

  it('fails validation if both id and name specified', () => {
    const actual = (command.validate() as CommandValidate)({ options: { id: '9e54299e-208a-4000-8546-cc4139091b26', name: 'PnP-CollabFooter-SharedLinks', termGroupName: 'PnPTermSets' } });
    assert.notEqual(actual, true);
  });

  it('fails validation if id is not a valid GUID', () => {
    const actual = (command.validate() as CommandValidate)({ options: { id: 'invalid', termGroupName: 'PnPTermSets' } });
    assert.notEqual(actual, true);
  });

  it('fails validation if neither termGroupId nor termGroupName specified', () => {
    const actual = (command.validate() as CommandValidate)({ options: { id: '9e54299e-208a-4000-8546-cc4139091b26' } });
    assert.notEqual(actual, true);
  });

  it('fails validation if both termGroupId and termGroupName specified', () => {
    const actual = (command.validate() as CommandValidate)({ options: { id: '9e54299e-208a-4000-8546-cc4139091b26', termGroupId: '9e54299e-208a-4000-8546-cc4139091b27', termGroupName: 'PnPTermSets' } });
    assert.notEqual(actual, true);
  });

  it('fails validation if termGroupId is not a valid GUID', () => {
    const actual = (command.validate() as CommandValidate)({ options: { id: '9e54299e-208a-4000-8546-cc4139091b26', termGroupId: 'invalid' } });
    assert.notEqual(actual, true);
  });

  it('passes validation when id and termGroupName specified', () => {
    const actual = (command.validate() as CommandValidate)({ options: { id: '9e54299e-208a-4000-8546-cc4139091b26', termGroupName: 'PnPTermSets' } });
    assert.equal(actual, true);
  });

  it('passes validation when name and termGroupName specified', () => {
    const actual = (command.validate() as CommandValidate)({ options: { name: 'People', termGroupName: 'PnPTermSets' } });
    assert.equal(actual, true);
  });

  it('passes validation when id and termGroupId specified', () => {
    const actual = (command.validate() as CommandValidate)({ options: { id: '9e54299e-208a-4000-8546-cc4139091b26', termGroupId: '9e54299e-208a-4000-8546-cc4139091b27' } });
    assert.equal(actual, true);
  });

  it('passes validation when name and termGroupId specified', () => {
    const actual = (command.validate() as CommandValidate)({ options: { name: 'PnP-CollabFooter-SharedLinks', termGroupId: '9e54299e-208a-4000-8546-cc4139091b26' } });
    assert.equal(actual, true);
  });

  it('supports debug mode', () => {
    const options = (command.options() as CommandOption[]);
    let containsOption = false;
    options.forEach(o => {
      if (o.option === '--debug') {
        containsOption = true;
      }
    });
    assert(containsOption);
  });

  it('has help referring to the right command', () => {
    const cmd: any = {
      log: (msg: string) => { },
      prompt: () => { },
      helpInformation: () => { }
    };
    const find = sinon.stub(vorpal, 'find').callsFake(() => cmd);
    cmd.help = command.help();
    cmd.help({}, () => { });
    assert(find.calledWith(commands.TERM_SET_GET));
  });

  it('has help with examples', () => {
    const _log: string[] = [];
    const cmd: any = {
      log: (msg: string) => {
        _log.push(msg);
      },
      prompt: () => { },
      helpInformation: () => { }
    };
    sinon.stub(vorpal, 'find').callsFake(() => cmd);
    cmd.help = command.help();
    cmd.help({}, () => { });
    let containsExamples: boolean = false;
    _log.forEach(l => {
      if (l && l.indexOf('Examples:') > -1) {
        containsExamples = true;
      }
    });
    Utils.restore(vorpal.find);
    assert(containsExamples);
  });

  it('correctly handles lack of valid access token', (done) => {
    Utils.restore(auth.ensureAccessToken);
    sinon.stub(auth, 'ensureAccessToken').callsFake(() => { return Promise.reject(new Error('Error getting access token')); });
    auth.site = new Site();
    auth.site.connected = true;
    auth.site.url = 'https://contoso-admin.sharepoint.com';
    cmdInstance.action = command.action();
    cmdInstance.action({ options: { debug: true } }, (err?: any) => {
      try {
        assert.equal(JSON.stringify(err), JSON.stringify(new CommandError('Error getting access token')));
        done();
      }
      catch (e) {
        done(e);
      }
    });
  });
});