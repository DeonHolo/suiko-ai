# ServiceNow connection research

**Original planning reference · 11 November 2026 · implementation update on 12 November**

The app is now connected and deployed through SDK 4.14.0 with the `suiko-pdi` profile. The app is `x_2236136_suiko_ai`, ID `b47095969f3848a7bdf385b3650b68c2`. Its page and API work and the PDI has completed live Gemini reviews. Use the [working project instructions](../servicenow-app/README.md) and [pipeline guide](13-servicenow-development-and-cicd.md) for the current commands. The earlier research below is retained as the dated planning record. Its future-tense status statements describe that earlier investigation.

**User update:** the teammate has not started the project app. Plan the new-app route first; the existing-app import commands below apply only if the teammate creates the shared app before local SDK setup. Do not ask for an existing app ID that has not been created.

The supplied instance is [dev309702.service-now.com](https://dev309702.service-now.com). ServiceNow's usual abbreviation is **PDI**, for Personal Developer Instance. The URL identifies the hosted environment; it does not synchronize this local folder with an application by itself. The SDK's connection uses an instance URL and stored authentication, while the application configuration identifies the app and scope. [SDK getting started](https://servicenow.github.io/sdk/getting-started)

## Two independent connections

| Connection | Purpose | What is being authenticated |
| --- | --- | --- |
| Local development → PDI | Read app metadata and install reviewed application changes | A developer account on the ServiceNow instance |
| PDI → AI provider or review service | Ask for a review while the application is running | The provider/service credential configured by the backend owner |

The SDK manages local/instance application development. RESTMessageV2 sends runtime outbound HTTP requests. Consequently, connecting the SDK does not configure Gemini access, and a working Gemini key does not authorize application deployment. This is an inference from those separate documented interfaces. [SDK CLI](https://servicenow.github.io/sdk/cli), [RESTMessageV2](https://www.servicenow.com/docs/r/api-reference/server-api-reference/c_RESTMessageV2API.html)

Your confirmed work remains AI behavior, prompts, contracts, evidence validation, and evaluation, with AI review UX/UI possible. The backend teammate owns deployment and runtime infrastructure. These connection steps describe the shared handoff rather than transferring the whole backend to you.

## Verified development routes

**On the instance:** ServiceNow Studio supports editing applications and application files in a browser. **On the laptop:** the SDK supports Fluent application development and installation onto an instance, including an appropriately authorized PDI. [ServiceNow developer learning plan](https://developer.servicenow.com/print_page.do?category=learning-plans&identifier=new_to_servicenow&module=learning+plan&release=yokohama), [SDK development guide](https://servicenow.github.io/sdk/guides/developing-apps-guide)

For this project, keep the AI contract, prompts, fixtures, and evaluation editable locally regardless of the team's deployment route. Choose **one coordinated route for modifying the shared app** before the first install. That is a project recommendation to preserve existing teammate work, not a platform prerequisite.

## Capability checks before SDK setup

The product installation documentation lists Node.js 20.18.0, npm 8.19.3, admin access, and SDK integration beginning with the Washington DC release. Feature availability still depends on the installed SDK and platform versions; these baseline requirements do not establish that every newer feature works on every supported family. [Install the ServiceNow SDK](https://www.servicenow.com/docs/r/application-development/servicenow-sdk/install-servicenow-sdk.html)

Basic and OAuth authentication are documented. The future username/password example explicitly selects `--type basic`, subject to the actual instance's authentication policy; check the chosen SDK version rather than relying on a default. Product authentication documentation describes ServiceNow IDE 1.1 or later or XML configuration for OAuth. The backend owner must check the actual instance rather than install or activate dependencies by guesswork. [SDK authentication](https://www.servicenow.com/docs/r/application-development/servicenow-sdk/authenticate-instance-now-sdk.html), [Product CLI reference](https://www.servicenow.com/docs/r/application-development/servicenow-sdk/servicenow-sdk-cli-commands.html)

Record the following before implementation:

- Actual release/build and installed ServiceNow IDE version, if using SDK OAuth or IDE-specific features.
- The team's app name, scope, and **application `sys_app` record ID**; do not confuse this with an article/table record ID.
- Whether that app already has a Git repository and which teammate coordinates installs.
- Chosen development route and approved SDK version, if applicable.

These are unverified properties of the supplied instance. A separate browser attempt reached a ServiceNow navigation title but did not expose a usable inventory. This research did not authenticate, inspect private instance records, install dependencies, or modify the app.

## Future SDK procedure

These are later implementation steps, not commands to run now. Use an empty, agreed SDK subfolder. Replace the placeholders with the team-approved SDK version and app ID first; inspect that pinned version's command help because option names evolve. `init` writes into its current directory. [SDK development guide](https://servicenow.github.io/sdk/guides/developing-apps-guide)

1. **Check tools.** Verify the team's chosen Node/npm versions meet the selected SDK's requirements.

   ```powershell
   node --version
   npm --version
   ```

2. **Add a local authentication alias.** Use the interactive prompt and SDK-managed local credentials. Do not put the password in a command argument. Verify with `auth --list`; do not use `auth --print`, which can emit a live token in current SDK versions. [SDK authentication](https://www.servicenow.com/docs/r/application-development/servicenow-sdk/authenticate-instance-now-sdk.html), [SDK CLI](https://servicenow.github.io/sdk/cli)

   ```powershell
   npx "@servicenow/sdk@<APPROVED_VERSION>" auth --add https://dev309702.service-now.com --type basic --alias backyardigans-dev
   npx "@servicenow/sdk@<APPROVED_VERSION>" auth --list
   ```

3. **Choose the new-app or existing-app branch.** Currently no project app exists. The backend owner can agree one new scoped app and scaffold it locally with the chosen SDK, or create it in Studio. The first SDK install is a separate instance-writing step. If the teammate creates the app before local setup, initialize from its application ID using the command below. That imports metadata rather than performing the later deployment. [SDK getting started](https://servicenow.github.io/sdk/getting-started)

   ```powershell
   npx "@servicenow/sdk@<APPROVED_VERSION>" init --from "<TEAM_SYS_APP_ID>" --auth backyardigans-dev
   npm install
   ```

4. **Build locally, then inspect the change.** Preserve stable metadata identifiers in source history and reconcile teammate changes. The documented `transform` synchronization can overwrite affected local edits, so preserve them before pulling instance-side changes. [SDK development guide](https://servicenow.github.io/sdk/guides/developing-apps-guide)

   ```powershell
   npx @servicenow/sdk build
   ```

5. **Install only the coordinated, reviewed package.** This writes to the PDI. Do not use `--reinstall true` as a routine update: the documented behavior removes instance metadata absent from the local package. Also review demo-data and flow-activation options for the chosen SDK version before deployment. [Build and install CLI options](https://www.servicenow.com/docs/r/application-development/servicenow-sdk/servicenow-sdk-cli-commands.html)

   ```powershell
   npx @servicenow/sdk install --auth backyardigans-dev
   npx @servicenow/sdk install --auth backyardigans-dev --info
   ```

The second command inspects the most recent installation rather than starting another. The concrete install settings and synchronization procedure belong in the team's agreed integration runbook, not in an unreviewed one-click setup script. [Product CLI reference](https://www.servicenow.com/docs/r/application-development/servicenow-sdk/servicenow-sdk-cli-commands.html)

## Git, update sets, and review data

Studio source-control integration supports non-production application imports, commits, branches, and remote changes; its application repository and credential requirements are separate from merely having a local folder. Do not point it at WildTrack and expect a Java/React academic app to become ServiceNow metadata. [Studio source-control integration](https://www.servicenow.com/docs/r/de-DE/application-development/servicenow-studio/source-control-integration.html)

Update sets capture application configuration, not ordinary task/process records. Therefore moving the app configuration is not a backup or migration plan for article revisions, AI review results, policy data, or human decisions. The backend owner must define which records are app configuration versus runtime data and how synthetic demo data is loaded. [Customizations tracked by update sets](https://www.servicenow.com/docs/r/application-development/system-update-sets/customizations-tracked-update-sets.html)

## Runtime connectivity and localhost

ServiceNow's documented outbound REST API can target an external HTTP endpoint. The visual Workflow Studio REST step is a separate capability requiring an Integration Hub subscription. Verify the available route; do not infer entitlement from the presence of a workflow editor. MCP is not required by the documented ordinary REST interface; a direct API/gateway design is a project option, not a claim that runtime integration is already configured. [RESTMessageV2](https://www.servicenow.com/docs/r/api-reference/server-api-reference/c_RESTMessageV2API.html), [REST step](https://www.servicenow.com/docs/r/build-workflows/workflow-studio/rest-request-action-designer.html)

`localhost` is the loopback name for the machine making the request. Consequently, a cloud ServiceNow request to `http://localhost:8080` does not reach the developer's laptop. This follows from loopback addressing, not from a ServiceNow-specific restriction. [RFC 6761, localhost](https://www.rfc-editor.org/rfc/rfc6761#section-6.3)

If the review engine remains an external service, the backend team must supply an authenticated endpoint reachable from the PDI. A hosted HTTPS endpoint is the proposed demo route; a private-network endpoint needs an agreed network path. ServiceNow documents MID Server routing to private endpoints, but that adds an active MID Server dependency and is not a default requirement for this project. [Outbound REST through a MID Server](https://www.servicenow.com/docs/r/xanadu/api-reference/web-services/c_OutboundRESTMIDServerSupport.html)

## Recommended planning decision

Continue local AI behavior/evaluation work now. Resolve the team app identity and deployment route before connecting a writer to the shared PDI. Prove the runtime boundary with a synthetic request and fixed response before adding a live Gemini call. The first reduces integration ambiguity; the second isolates transport, record persistence, and UI wiring from model variability. These are proposed workflow decisions, not completed implementation steps.
