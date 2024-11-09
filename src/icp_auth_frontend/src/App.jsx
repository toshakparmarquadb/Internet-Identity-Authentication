// import React, { useState, useEffect } from 'react';
// import { Principal } from '@dfinity/principal';
// import { HttpAgent } from '@dfinity/agent';
// import { AuthClient } from "@dfinity/auth-client";
// import { createActor as createBackendActor } from '../../declarations/icp_auth_backend/index';
// import { createAgent, getAuthClient } from './utils/auth';

// // Custom hook for authentication state management
// function useAuth() {
//   const [authClient, setAuthClient] = useState(null);
//   const [isAuthenticated, setIsAuthenticated] = useState(false);
//   const [identity, setIdentity] = useState(null);
//   const [principal, setPrincipal] = useState(null);
//   const [actor, setActor] = useState(null);

//   const clientInfo = async (client) => {
//     const authStatus = await client.isAuthenticated();
//     const identity = client.getIdentity();
//     const principal = identity.getPrincipal();

//     setAuthClient(client);
//     setIsAuthenticated(authStatus);
//     setIdentity(identity);
//     setPrincipal(principal);

//     if (authStatus && identity && principal && !principal.isAnonymous()) {
//       const agent = new HttpAgent({ identity });
//       if (process.env.DFX_NETWORK !== "ic") {
//         await agent.fetchRootKey();
//       }
      
//       const backendActor = createBackendActor(
//         process.env.CANISTER_ID_ICP_AUTH_BACKEND,
//         { agent }
//       );
//       setActor(backendActor);
//     }
//     return true;
//   };

//   const login = () => {
//     return new Promise(async (resolve, reject) => {
//       try {
//         if (
//           authClient?.isAuthenticated() &&
//           !(await authClient.getIdentity().getPrincipal().isAnonymous())
//         ) {
//           resolve(clientInfo(authClient));
//         } else {
//           await authClient.login({
//             identityProvider:
//               process.env.DFX_NETWORK === "ic"
//                 ? "https://identity.ic0.app/"
//                 : `http://localhost:4943/?canisterId=${process.env.CANISTER_ID_INTERNET_IDENTITY}`,
//             onError: (error) => reject(error),
//             onSuccess: () => resolve(clientInfo(authClient)),
//             derivationOrigin: window.location.origin,
//           });
//         }
//       } catch (error) {
//         reject(error);
//       }
//     });
//   };

//   const logout = async () => {
//     await authClient?.logout();
//     setIsAuthenticated(false);
//     setIdentity(null);
//     setPrincipal(null);
//     setActor(null);
//   };

//   useEffect(() => {
//     (async () => {
//       const client = await AuthClient.create();
//       clientInfo(client);
//     })();
//   }, []);

//   return {
//     login,
//     logout,
//     authClient,
//     isAuthenticated,
//     identity,
//     principal,
//     actor,
//   };
// }

// function App() {
//   const { 
//     login, 
//     logout, 
//     isAuthenticated, 
//     principal, 
//     actor 
//   } = useAuth();
  
//   const [messages, setMessages] = useState([]);
//   const [newMessage, setNewMessage] = useState('');
//   const [name, setName] = useState('');

//   useEffect(() => {
//     if (actor) {
//       fetchMessages();
//     }
//   }, [actor]);

//   async function fetchMessages() {
//     if (actor) {
//       try {
//         const msgs = await actor.get_messages();
//         setMessages(msgs);
//       } catch (error) {
//         console.error("Error fetching messages:", error);
//       }
//     }
//   }

//   async function handleSubmitMessage(e) {
//     e.preventDefault();
//     if (actor && newMessage) {
//       try {
//         await actor.add_message(newMessage);
//         setNewMessage('');
//         await fetchMessages();
//       } catch (error) {
//         console.error("Error submitting message:", error);
//       }
//     }
//   }

//   async function handleUpdateName(e) {
//     e.preventDefault();
//     if (actor && name) {
//       try {
//         await actor.update_name(name);
//         setName('');
//       } catch (error) {
//         console.error("Error updating name:", error);
//       }
//     }
//   }

//   return (
//     <div>
//       <h1>Internet Identity Demo</h1>
      
//       {!isAuthenticated ? (
//         <div>
//           <button onClick={login}>Login with Internet Identity</button>
//         </div>
//       ) : (
//         <div>
//           <div>
//             <p>Logged in as: {principal?.toString()}</p>
//             <button onClick={logout}>Logout</button>
//           </div>
          
//           <form onSubmit={handleUpdateName}>
//             <input
//               type="text"
//               value={name}
//               onChange={(e) => setName(e.target.value)}
//               placeholder="Enter your name"
//             />
//             <button type="submit">Update Name</button>
//           </form>

//           <form onSubmit={handleSubmitMessage}>
//             <input
//               type="text"
//               value={newMessage}
//               onChange={(e) => setNewMessage(e.target.value)}
//               placeholder="Enter a message"
//             />
//             <button type="submit">Send Message</button>
//           </form>

//           <h2>Messages:</h2>
//           <ul>
//             {messages.map((msg, index) => (
//               <li key={index}>{msg}</li>
//             ))}
//           </ul>
//         </div>
//       )}
//     </div>
//   );
// }

// export default App;


import React, { useState, useEffect } from 'react';
import { useAuthClient } from "./utils/auth";
import { setActors } from './utils/redux/actorSlice';
import { Principal } from '@dfinity/principal';
import { useDispatch } from 'react-redux';

function App() {

  const { login, logout, authClient, isAuthenticated, identity, principal } = useAuthClient();
  const [isAuthentication, setIsAuthentication] = useState(null);
  const [newIdentity, setNewIdentity] = useState(null);
  const [newPrincipal, setNewPrincipal] = useState(null);
  // const [messages, setMessages] = useState([]);
  // const [newMessage, setNewMessage] = useState('');
  // const [username, setUserName] = useState('');

  async function checkAuth() {
    try{
      if(authClient && isAuthenticated && identity && principal){
        console.log("IsAuthenticated : ", isAuthenticated);
        setIsNewAuthentication(isAuthenticated);
        console.log("identity : ",identity);
        setNewIdentity(identity);
        console.log("principal : ", principal);
        setNewPrincipal(principal);
      }
    }catch(error){
      console.log("Error : ", error);
    }
  }

  async function handleLogin() {
    await login();
    checkAuth();
    console.log("Logged In");
  }

  async function handleLogout() {
    await logout();
    setIsAuthentication(false);
    // setActor(null);
    // setMessages([]);
  }

  // async function fetchMessages() {
  //   if (actor) {
  //     const msgs = await actor.get_messages();
  //     setMessages(msgs);
  //   }
  // }

  // async function handleSubmitMessage(e) {
  //   e.preventDefault();
  //   if (actor && newMessage) {
  //     await actor.add_message(newMessage);
  //     setNewMessage('');
  //     fetchMessages();
  //   }
  // }

  // async function handleUpdateName(e) {
  //   e.preventDefault();
  //   if (actor && name) {
  //     await actor.update_name(name);
  //     setUserName('');
  //   }
  // }

  // useEffect(() => {
  //   checkAuth();
  // }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center">
      <h1 className="text-4xl font-bold mb-6 text-center">Internet Identity Authentication</h1>
      
      {!isAuthenticated || isAuthentication ? (
        <button 
          onClick={handleLogin} 
          className="bg-indigo-600 text-white px-6 py-3 rounded-lg shadow-lg hover:bg-indigo-500 transition duration-300 ease-in-out"
        >
          Login with Internet Identity
        </button>
      ) : (
        <div className="flex flex-col items-center space-y-4">
          {/* Principal Display */}
          <div className="text-lg bg-gray-800 p-4 rounded-lg shadow-md">
            <strong>Principal:</strong> <span>{principal.toString()}</span>
          </div>
          
          {/* Logout Button */}
          <button 
            onClick={handleLogout} 
            className="bg-red-600 text-white px-6 py-3 rounded-lg shadow-lg hover:bg-red-500 transition duration-300 ease-in-out"
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
}

export default App;