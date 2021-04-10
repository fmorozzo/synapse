import { ref } from 'vue'


const apiUrl = ref('https://api.airtable.com/v0/')
const apiKey = ref('keyQKXuzuIIC7c8Ph') // Always use a read-only account token
const appID = ref('app0Z70uYtVAdttHi')
const base = ref('/Records')
const sort = ref('sort%5B0%5D%5Bdirection%5D=asc&sort%5B0%5D%5Bfield%5D=')
const formula = ref('')
const searchField = ref('Artist')
const records = ref({})
const isCalled = ref(false)
const isSuccess = ref(false)
const isStatusOK = ref(false)
const error = ref(null)

const formURL = (field, query) => {
    formula.value = 'filterByFormula=SEARCH(LOWER(%22' + query + '%22)%2C+LOWER(' + field + '))'
    return apiUrl.value + appID.value + base.value + '?' + formula.value + '&' + sort.value + searchField.value
}

const searchQueryByField = async (field, query) => {
    isCalled.value = true
    try {
        const res = await axios({
            url: formURL(field, query),
            headers: {
                'Authorization': `Bearer ${apiKey.value}`
            }
        }).then((res) => {
            records.value = res.data.records;
            if(res.status == 200){
                isStatusOK.value = true
                console.log(isStatusOK.value)
            }
             if(res.data.records.length){
                isSuccess.value = true
            }
        })
        return res

    } catch(err){
        console.log('error in getRecords : ', err.message)
        error.value = err.message
    }
}
const getRecords = () => {
    return { records , searchQueryByField, isCalled, isStatusOK, isSuccess, error }
}

export default getRecords