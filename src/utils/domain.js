export function baseUrl() {
  const domain = document.domain
  console.log('--------------')
  console.log(domain)
  if (domain == '10.0.41.30' || domain == 'localhost') {
    //测试服
    return 'http://10.0.41.30:8080'
  } else if (domain == '10.0.24.63') {
    //正式服
    return 'http://10.0.24.63:8080'
  }
}
