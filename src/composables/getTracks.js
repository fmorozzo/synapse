import { ref } from 'vue'


const apiUrl = ref('https://api.airtable.com/v0/')
const apiKey = ref('keyQKXuzuIIC7c8Ph') // Always use a read-only account token
const appID = ref('app0Z70uYtVAdttHi')
const base = ref('/Tracks')
//const sort = ref('sort%5B0%5D%5Bdirection%5D=asc&sort%5B0%5D%5Bfield%5D=')
const formula = ref('')
const tracks = ref({})
const isCalled = ref(false)
const isSuccess = ref(false)
const isStatusOK = ref(false)
const error = ref(null)


const formURL = (releaseID) => {
    formula.value = 'filterByFormula=SEARCH(%22Kuniyuki%22%2C+Artist)' // foctionne
 //   formula.value = 'filterByFormula=SEARCH(%22' + releaseID + '%22%2C+Track_id)'
    //formula.value = 'filterByFormula=FIND(%22' + releaseID + '%22%2CTrack_id)%3E%3D0'
    //console.log('getTracks -> formula.value : ' + formula.value)
    return apiUrl.value + appID.value + base.value + '?' + formula.value
    
}

const searchTracksByReleaseID = async (releaseID) => {
    isCalled.value = true
    try {
        const res = await axios({
            url: formURL(releaseID),
            headers: {
                'Authorization': `Bearer ${apiKey.value}`
            }
        }).then((res) => {
            tracks.value = res.data.records;
            if(res.status == 200){
                isStatusOK.value = true
            }
             if(res.data.records.length){
                isSuccess.value = true
            }
        })
        return res

    } catch(err){
        console.log('error in getTracks : ', err.message)
        error.value = err.message
    }
}
const getTracks = () => {
    return { tracks , searchTracksByReleaseID, isCalled, isStatusOK, isSuccess, error }
}

export default getTracks