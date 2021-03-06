const actionRoot = require('./actions/index').default;
const actionGraphQL = require('./actions/graphql/index').default;
const actionAuthGitHub = require('./actions/auth/github').default;
const actionAuthGitHubCallback = require('./actions/auth/githubCallback').default;
const actionNews = require('./actions/news/index').default;
const actionListsProjects = require('./actions/lists/projects/index').default;
const actionListsOrganizations = require('./actions/lists/organizations/index').default;
const actionEvents = require('./actions/events/index').default;
const actionGitHubProfile = require('./actions/github/profile').default;
const actionGitHubImportUser = require('./actions/github/importUser').default;
const actionGitHubImportOrganization = require('./actions/github/importOrganization').default;
const actionGitHubImportRepository = require('./actions/github/importRepository').default;
const actionEventUsersUpdate = require('./actions/users/eventUsersUpdate').default;

function fixExceptionObjectResult(ex) {
    const serialized = JSON.stringify(ex, Object.getOwnPropertyNames(ex));

    return serialized;
}

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Credentials': true,
};

async function lambdaContext(func) {
    try {
        const result = await func();

        return {
            statusCode: 200,
            headers: corsHeaders,
            body: result !== undefined ?
                JSON.stringify(result) :
                undefined,
        };
    }
    catch (ex) {
        return {
            statusCode: 500,
            headers: corsHeaders,
            body: fixExceptionObjectResult(ex),
        };
    }
}

const routes = {
    'root': event => lambdaContext(() => actionRoot(event)),
    'graphql': event => lambdaContext(() => {
        const { query } = JSON.parse(event.body);

        return actionGraphQL(query);
    }),
    'authGitHub': () => lambdaContext(() => actionAuthGitHub()),
    'authGitHubCallback': event => lambdaContext(() => actionAuthGitHubCallback(event.queryStringParameters)),
    'news': () => lambdaContext(() => actionNews()),
    'listsProjects': () => lambdaContext(() => actionListsProjects()),
    'listsOrganizations': () => lambdaContext(() => actionListsOrganizations()),
    'events': () => lambdaContext(() => actionEvents()),
    'gitHubProfile': event => lambdaContext(() => actionGitHubProfile(event.headers.Authorization)),
    'gitHubImportUser': event => lambdaContext(() => actionGitHubImportUser(JSON.parse(event.Records[0].body))),
    'gitHubImportOrganization': event => lambdaContext(() => actionGitHubImportOrganization(JSON.parse(event.Records[0].body))),
    'gitHubImportRepository': event => lambdaContext(() => actionGitHubImportRepository(JSON.parse(event.Records[0].body))),
    'eventUsersUpdate': event => lambdaContext(() => actionEventUsersUpdate(event)),
};

module.exports = routes;
