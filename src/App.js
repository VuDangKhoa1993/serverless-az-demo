import { useContext, useEffect, useState } from 'react';
import '@aws-amplify/ui-react/styles.css';
import { Authenticator, useAuthenticator } from '@aws-amplify/ui-react';
import { Amplify } from 'aws-amplify';
import { fetchAuthSession, fetchUserAttributes } from 'aws-amplify/auth';
import { get, post } from 'aws-amplify/api';


Amplify.configure({
  Auth: {
    Cognito: {
      userPoolClientId: '105uspmg5mdpqnoc1856rr3qne',
      userPoolId: 'ap-southeast-1_BxneTJff3',
    }
  },
  
})

function App() {
  const { user } = useAuthenticator((context) => [context.user]);
  const [userSession, setUserSession] = useState(null)
  const [userAttributes, setUserAttributes] = useState(null)

  useEffect(() => {
    if (user) {
      const getUserAuthenData = async () => {
        const [session, attributes] = await Promise.all([fetchAuthSession(), fetchUserAttributes()]);
        setUserSession(session);
        setUserAttributes(attributes);
      }
      getUserAuthenData();
    }
  }, [user]);

  useEffect(() => {
    if (userSession) {
      const idToken = userSession.tokens?.idToken.toString();
      const existingConfig = Amplify.getConfig();
      Amplify.configure({
        ...existingConfig,
        API: {
          REST: {
            'api-sls': {
              endpoint: 'https://pvt14meip6.execute-api.ap-southeast-1.amazonaws.com/dev',
              region: 'ap-southeast-1'
            },
            headers: async () => {
              return { Authorization: idToken };
            }
          }
        }
      });
    }
  }, [userSession])

  const getProduct = async () => {
    try {
      const restOperation = get({
        path: '/product',
        apiName: 'api-sls',
        options: {
          headers: {
            Authorization: userSession.tokens?.idToken.toString()
          }
        }
      },);
      const response = await restOperation.response;
      console.log('GET call succeeded: ', await response.body.json());
    } catch (error) {
      console.log('GET call failed: ', JSON.parse(error.response.body));
    }
  }


  const createProduct = async () => {
    try {
      const restOperation = post({
        path: '/product',
        apiName: 'api-sls',
        options: {
          headers: {
            Authorization: userSession.tokens?.idToken.toString()
          },
          queryParams: {},
          body: {
            name: 'book',
            quality: 123            
          }
        },
      },);
      const response = await restOperation.response;
      console.log('POST call succeeded: ', await response.body.json());
    } catch (error) {
      console.log('POST call failed: ', JSON.parse(error.response.body));
    }
  }

  return (
    <div className="app">
      <h1>AWS Serverless - Amplify Authentication with Cognito</h1>
      <Authenticator loginMechanisms={['email']} signUpAttributes={[
        'name',
        'phone_number',
      ]}
      >
        {({ signOut }) => {
          return (
            <main>
              <h1>Hello {userAttributes?.name} - {userAttributes?.email}</h1>
              <p>Secret Id Token: {userSession?.tokens.idToken.toString()}</p>
              <button onClick={getProduct}>Get Product</button>
              <button onClick={createProduct}>Create Product</button>
              <button onClick={signOut}>Sign out</button>
            </main>
          )
        }}
      </Authenticator>
    </div>
  );
}

export default App;
