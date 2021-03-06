import React from "react";
import { useRealmApp } from "../../RealmApp";
import { ApolloClient, HttpLink, InMemoryCache, ApolloProvider } from "@apollo/client";

const createRealmApolloClient = (app) => {
    const link = new HttpLink({
        uri: `https://eu-central-1.aws.realm.mongodb.com/api/client/v2.0/app/${app.id}/graphql`,
        fetch: async (uri, options) => {
            if (!app.currentUser) {
                throw new Error("Must be logged in to use the GraphQL API");
            }
            // Refreshing a user's custom data also refreshes their access token
            await app.currentUser.refreshCustomData();
            // The handler adds a bearer token Auth header to the otherwise unchanged request
            options.headers.Authorization = `Bearer ${app.currentUser.accessToken}`;
            return fetch(uri, options);
        }
    });

    const cache = new InMemoryCache();

    return new ApolloClient({ link, cache });
}

const RealmApolloProvider = ({ children }) => {
    const app = useRealmApp();
    const [client, setClient] = React.useState(createRealmApolloClient(app));

    React.useEffect(() => {
        setClient(createRealmApolloClient(app));
    }, [app]);
    return <ApolloProvider client={client}>{children}</ApolloProvider>
}

export default RealmApolloProvider;