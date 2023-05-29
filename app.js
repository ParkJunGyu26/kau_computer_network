const express = require('express')
const socket = require('socket.io')
const http = require('http')
const fs = require('fs')

const app = express()
const server = http.createServer(app)
const io = socket(server)

// 정적파일(프론트)을 위한 미들웨어
// app.use()를 사용하여 원하는 미들웨어를 추가하여 조합 가능
app.use('/css', express.static('./static/css'))
app.use('/js', express.static('./static/js'))

// GET방식으로 웹서버에 요청
// fs모듈은 파일 관련을 처리
app.get('/', function(req, res) {
  fs.readFile('./static/index.html', function(err, data) {
    if (err) {
      res.send('error')
    } else {
      res.writeHead(200, {'Content-Type':'text/html'})
      res.write(data)
      res.end()
    }
  })
})


// io.socket은 접속되는 모든 소켓들을 의미
// connection, disconnect 등은 기본 이벤트
// send는 커스텀 이벤트.(직접 만든 이벤트)
io.sockets.on('connection', function(socket) {

  // newUser라는 커스텀이벤트. 누군가 새로 채팅방에 연결했을 때, 발생하는 이벤트
  socket.on('newUser', function(name) {
    console.log(name + '님이 접속하였습니다.')

    socket.name = name

    // 모든 소켓에 update라는 이벤트를 통해 누군가 들어왔다고 전송
    // update는 직접 만든 이벤트
    io.sockets.emit("update", {type: 'connect', name: 'SERVER', message: name + '님이 접속하였습니다.'})
  })

  socket.on('message', function(data) {
    

    data.name = socket.name
  })

  socket.on('send', function(data) {
    console.log('전달된 메시지:', data.msg)
  })

  socket.on('disconnect', function() {
    console.log('접속 종료')
  })
})

// 원하는 포트 번호를 '2525'자리에 넣기
server.listen(2525, function() {
  console.log('server on')
})