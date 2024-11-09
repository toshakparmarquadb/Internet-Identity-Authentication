// import { AuthClient } from "@dfinity/auth-client";
// import { Actor, HttpAgent } from "@dfinity/agent";
// import { idlFactory } from "../../../declarations/icp_auth_backend/icp_auth_backend.did.js";
// import { useDispatch } from "react-redux";
// import React, { useState, useEffect } from 'react';
// import { setActors, clearActors } from "./redux/actorSlice.js"; // Ensure clearActors is imported to reset actors on logout

// const II_URL = process.env.DFX_NETWORK === "ic" 
//   ? "https://identity.ic0.app"
//   : `http://localhost:4943/?canisterId=${process.env.CANISTER_ID_INTERNET_IDENTITY}`;

// export async function createActor(canisterId, options = {}) {
//   const agent = new HttpAgent({ ...options?.agentOptions });

//   if (process.env.DFX_NETWORK !== "ic") {
//     await agent.fetchRootKey().catch(err => {
//       console.warn("Unable to fetch root key. Check to ensure that your local replica is running");
//       console.error(err);
//     });
//   }

//   return Actor.createActor(idlFactory, {
//     agent,
//     canisterId,
//     ...options?.actorOptions,
//   });
// }

// export const useAuthClient = () => {
//   const dispatch = useDispatch();
//   const [authClient, setAuthClient] = useState(null);
//   const [isAuthenticated, setIsAuthenticated] = useState(false);
//   const [identity, setIdentity] = useState(null);
//   const [principal, setPrincipal] = useState(null);

//   const clientInfo = async (client) => {
//     const authStatus = await client.isAuthenticated();
//     const identity = client.getIdentity();
//     const principal = identity.getPrincipal();

//     setAuthClient(client);
//     setIsAuthenticated(authStatus);
//     setIdentity(identity);
//     setPrincipal(principal);

//     if (authStatus && !principal.isAnonymous()) {
//       try {
//         const agent = new HttpAgent({ identity });
        
//         // Await actor creation to resolve the Promise before dispatching
//         const communityActor = await createActor(
//           process.env.CANISTER_ID_ICP_AUTH_BACKEND,
//           { agent }
//         );
//         const economyActor = await createActor(
//           process.env.CANISTER_ID_ICP_AUTH_BACKEND,
//           { agent }
//         );

//         // Dispatch resolved actors to Redux
//         dispatch(setActors({
//           communityActor,
//           economyActor,
//         }));
//       } catch (error) {
//         console.error("Failed to create actors:", error);
//       }
//     }
//   };

//   useEffect(() => {
//     (async () => {
//       const client = await AuthClient.create();
//       await clientInfo(client);
//     })();
//   }, []);

//   const login = async () => {
//     if (!authClient) return;
//     return new Promise((resolve, reject) => {
//       authClient.login({
//         identityProvider: II_URL,
//         onError: reject,
//         onSuccess: async () => {
//           await clientInfo(authClient);
//           resolve(true);
//         },
//       });
//     });
//   };

//   const logout = async () => {
//     await authClient?.logout();
//     dispatch(clearActors());
//     setIsAuthenticated(false);
//   };

//   return {
//     login,
//     logout,
//     authClient,
//     isAuthenticated,
//     identity,
//     principal,
//   };
// };

// export async function getAuthClient() {
//   return await AuthClient.create();
// }

// export async function login() {
//   const authClient = await getAuthClient();
//   return new Promise((resolve) => {
//     authClient.login({
//       identityProvider: II_URL,
//       onSuccess: () => resolve(authClient),
//     });
//   });
// }



import { AuthClient } from "@dfinity/auth-client";
import { Actor, HttpAgent } from "@dfinity/agent";
// import { idlFactory } from "../../../declarations/icp_auth_backend/icp_auth_backend.did.js";
import {createActor as createBackendActor} from "../../../declarations/icp_auth_backend";
import { useDispatch } from "react-redux";
import React, { useState, useEffect } from 'react';
import { setActors, clearActors } from "./redux/actorSlice.js";

const II_URL = process.env.DFX_NETWORK === "ic" 
  ? "https://identity.ic0.app"
  : `http://localhost:4943/?canisterId=${process.env.CANISTER_ID_INTERNET_IDENTITY}`;

export async function createActor(canisterId, options = {}) {
  const agent = new HttpAgent({ ...options?.agentOptions });

  if (process.env.DFX_NETWORK !== "ic") {
    await agent.fetchRootKey().catch(err => {
      console.warn("Unable to fetch root key. Check to ensure that your local replica is running");
      console.error(err);
    });
  }

  return Actor.createActor(idlFactory, {
    agent,
    canisterId,
    ...options?.actorOptions,
  });
}

export const useAuthClient = () => {

    const dispatch = useDispatch();
  
  
    // const actor = useSelector(state => state?.actors?.actors);
    // console.log("actor : ", actor);
  
  
    const [authClient, setAuthClient] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [identity, setIdentity] = useState(null);
    const [principal, setPrincipal] = useState(null);
  
    const clientInfo = async (client) => {
      console.log("client auth status : ", await client.isAuthenticated());
      console.log("client : ", await client);
      const authStatus = await client.isAuthenticated();
      const identity = client.getIdentity();
      const principal = identity.getPrincipal();
      console.log("principal : ", principal);
  
      setAuthClient(client);
      setIsAuthenticated(authStatus);
      setIdentity(identity);
      setPrincipal(principal);

      console.log("Auth Client: ",authClient);
      console.log("Auth Status : ",authStatus);
      console.log("Identity : ",identity);
      console.log("Principal : ",principal);
  
      if (
        authStatus &&
        identity &&
        principal &&
        principal.isAnonymous() === false
      ) {
        const agent = new HttpAgent({ identity: client.getIdentity() });
        let backendActor = createBackendActor(
          process.env.CANISTER_ID_ICP_AUTH_BACKEND,
          {
            agent: agent,
          }
        );
  
        dispatch(setActors({
            backendActor: backendActor
        }))
      }
      return true;
    };
  
    useEffect(() => {
      (async () => {
        const authClient = await AuthClient.create();
        console.log(authClient);
        clientInfo(authClient);
      })();
    }, []);
  
    const login = async () => {
      return new Promise(async (resolve, reject) => {
        try {
          if (
            authClient.isAuthenticated() &&
            (await authClient.getIdentity().getPrincipal().isAnonymous()) ===
            false
          ) {
            resolve(clientInfo(authClient));
            
          } else {
            await authClient.login({
              identityProvider:
                process.env.DFX_NETWORK === "ic"
                  ? "https://identity.ic0.app/"
                  : `http://rdmx6-jaaaa-aaaaa-aaadq-cai.localhost:4943`,
              onError: (error) => reject(error),
              onSuccess: () => resolve(clientInfo(authClient)),
            });
          }
        } catch (error) {
          reject(error);
        }
      });
    };
  
    const logout = async () => {
      await authClient?.logout();
      dispatch(clearActors());
      setIsAuthenticated(false);
    };
  
    return {
      login,
      logout,
      authClient,
      isAuthenticated,
      identity,
      principal,
    };
  };

// export async function getAuthClient() {
//   return await AuthClient.create();
// }

// export async function login() {
//   const authClient = await getAuthClient();
  
//   return new Promise((resolve) => {
//     authClient.login({
//       identityProvider: II_URL,
//       onSuccess: () => {
//         resolve(authClient);
//       },
//     });
//   });
// }
