import { Client, Databases, ID, Query } from "appwrite";

const DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID;
const COLLECTION_ID = import.meta.env.VITE_APPWRITE_COLLECTION_ID;
const PROJECT_ID = import.meta.env.VITE_APPWRITE_PROJECT_ID;



const client = new Client()
.setEndpoint(import.meta.env.VITE_APPWRITE_ENDPOINT)
.setProject(PROJECT_ID)


const database = new Databases(client)



export const updateSearchCount = async(searchTerm, movie) => {
    // Use appwrite sdk to check if the search term exists in the database 
    try{
        const result = await database.listDocuments(DATABASE_ID, COLLECTION_ID, [
            Query.equal('searchTerm', searchTerm)
        ])

        // If it exist then update the count 
        if(result.documents.length > 0){
            const doc = result.documents[0];

            await database.updateDocument(DATABASE_ID, COLLECTION_ID, doc.$id,{
                count: doc.count + 1
            })
        }
        else{
            // If not then create a new document with the search term and count as 1 
            await database.createDocument(DATABASE_ID, COLLECTION_ID, ID.unique(), {
                searchTerm: searchTerm,
                count: 1,
                movie_id : movie.id,
                poster_url:`https://image.tmdb.org/t/p/w500${movie.poster_path}` || '',
            })
        }
    }catch(error){
        console.error("Error updating search count", error)
    }

}


export const getTrendingMovies = async() => {
    try{
        const result = await database.listDocuments(DATABASE_ID, COLLECTION_ID, [
            Query.orderDesc('count'),
            Query.limit(5)
        ]);

        return result.documents;

        return result.documents.map(doc => ({
            searchTerm: doc.searchTerm,
            count: doc.count,
            movie_id: doc.movie_id,
            poster_url: doc.poster_url
        }));
    }catch(error){
        console.error("Error fetching trending movies", error);
    }
}
