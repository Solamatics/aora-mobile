import {
  Account,
  Avatars,
  Client,
  Databases,
  ID,
  Query,
  Storage,
} from "react-native-appwrite";

export const appwriteConfig = {
  endpoint: "https://cloud.appwrite.io/v1",
  platform: "com.palmtech.aora-mobile",
  projectId: "66bda6dd002d9c2f8648",
  databaseId: "66bda9b600258117d0d7",
  userCollectionId: "66bda9ed000947592359",
  videoCollectionId: "66bdaa0b002771ceca6a",
  storageId: "66bdabe5003b6d9b8c17",
};

const client = new Client();

const {
  endpoint,
  platform,
  projectId,
  databaseId,
  userCollectionId,
  videoCollectionId,
  storageId,
} = appwriteConfig;

client
  .setEndpoint(appwriteConfig.endpoint)
  .setProject(appwriteConfig.projectId)
  .setPlatform(appwriteConfig.platform);

const account = new Account(client);
const storage = new Storage(client);
const avatars = new Avatars(client);
const databases = new Databases(client);

// Register user
export async function createUser(email, password, username) {
  try {
    const newAccount = await account.create(
      ID.unique(),
      email,
      password,
      username,
    );

    if (!newAccount) throw Error;

    const avatarUrl = avatars.getInitials(username);

    await signIn(email, password);

    const newUser = await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      ID.unique(),
      {
        accountId: newAccount.$id,
        email: email,
        username: username,
        avatar: avatarUrl,
      },
    );

    return newUser;
  } catch (error) {
    throw new Error(error.message || "Error occurd during signup");
  }
}

// Sign In
// export async function signIn(email, password) {
//   try {
//     const session = await account.createEmailPasswordSession(email, password);
//     console.log(session)

//     return session;
//   } catch (error) {
//     throw new Error(error.message || "Error occurd during signup");
//   }
// }

export const signIn = async (email, password) => {
  try {
    // Check if there's an active session
    const currentSession = await account.getSession();

    if (currentSession) {
      console.log("User is already signed in:", currentSession);
      return currentSession;
    }

    // If no active session, create a new session
    const session = await account.createEmailPasswordSession(email, password);
    console.log("New session created:", session);

    return session;
  } catch (error) {
    throw new Error(error.message || "Error occurred during sign-in");
  }
};

export const currentUser = async () => {
  try {
    const currentAccount = await account.get();

    if (!currentAccount) throw Error;

    const currentUser = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      [Query.equal("accountId", currentAccount.$id)],
    );

    if (!currentUser) throw Error;
    return currentUser.documents[0];
  } catch (error) {
    console.log(error);
  }
};

export const getAllPosts = async () => {
  try {
    const post = await databases.listDocuments(databaseId, videoCollectionId);
    return post.documents;
  } catch (error) {
    throw new Error(error);
  }
};
