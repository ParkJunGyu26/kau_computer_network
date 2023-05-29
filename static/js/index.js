var socket = io()

socket.on('connect', function() {

    // 이름을 입력받기
    var name = prompt('반갑습니다!', '')

    // 이름이 빈칸인 경우 (반복문을 통해 이름을 반드시 입력하도록 유도)
    while (!name) {
        var name = prompt('이름을 작성해주세요!', '')
    }

    socket.emit('newUser', name)
})

socket.on('update', function(data) {
    console.log(`${data.name}: ${data.message}`)
})

// 전송 함수
function send() {
    // 입력된 데이터 가져오기
    var message = document.getElementById('test').value

    // 가져왔으니 데이터를 빈칸으로 변경
    document.getElementById('test').value = ''

    // 서버로 message 이벤트를 데이터와 함께 전달
    socket.emit('message', {type: 'message', message: message})
}