import { ref } from 'vue'
import { projectfirestore } from '../firebase/config'

const getCollection = ( collection ) => {
    const documents = ref(null)
    const error = ref(null)

    let collectionRef = projectfirestore.collection(collection)
    .orderBy('artist')

    collectionRef.onSnapshot((snap) => {
        let results = []
        snap.docs.forEach(doc => {
            results.push({ ...doc.data(), id: doc.id } )
        })
        documents.value = results
        error.value = null
    }), (err) => {
        console.log(err.message)
        documents.value = null
        error.value = 'could not fetch data'
    }

    return { documents, error }
}

export default getCollection