
        // Muaz Khan     - www.MuazKhan.com
        // MIT License   - www.WebRTC-Experiment.com/licence
        // Documentation - www.RTCMultiConnection.org
        (function() {
            var uniqueToken = document.getElementById('unique-token');
            if (uniqueToken)
                if (location.hash.length > 2) uniqueToken.parentNode.parentNode.parentNode.innerHTML = '<h2 style="text-align:center;"><a href="' + location.href + '" target="_blank">Share this link</a></h2>';
                else uniqueToken.innerHTML = uniqueToken.parentNode.parentNode.href = '#' + (Math.random() * new Date().getTime()).toString(36).toUpperCase().replace(/\./g, '-');
        })();

        var connection = new RTCMultiConnection();
        connection.session = {
            audio: true,
            video: true
        };

        var roomsList = document.getElementById('rooms-list'),
            sessions = {};
        connection.onNewSession = function(session) {
            if (sessions[session.sessionid]) return;
            sessions[session.sessionid] = session;
            var tr = document.createElement('tr');
            tr.innerHTML = '<td><span style="color:red"><italic> Phòng \"' + session.extra['session-name'] + '\"</italic> đã được tạo.</span></td>' +
                '<td><button class="join btn btn-success">Vào phòng</button></td>';
            roomsList.insertBefore(tr, roomsList.firstChild);
            tr.querySelector('.join').setAttribute('data-sessionid', session.sessionid);
            tr.querySelector('.join').onclick = function() {
                this.disabled = true;
                session = sessions[this.getAttribute('data-sessionid')];
                if (!session) alert('Không tồn tại phòng.');
                connection.join(session);
            };
        };

        var videosContainer = document.getElementById('videos-container') || document.body;
        connection.onstream = function(e) {
            var buttons = ['mute-audio', 'mute-video', 'full-screen', 'volume-slider'];
            if (connection.session.audio && !connection.session.video) {
                buttons = ['mute-audio', 'full-screen'];
            }
            var mediaElement = getMediaElement(e.mediaElement, {
                width: (videosContainer.clientWidth / 2) - 50,
                title: e.userid,
                buttons: buttons,
                onMuted: function(type) {
                    connection.streams[e.streamid].mute({
                        audio: type == 'audio',
                        video: type == 'video'
                    });
                },
                onUnMuted: function(type) {
                    connection.streams[e.streamid].unmute({
                        audio: type == 'audio',
                        video: type == 'video'
                    });
                }
            });
            videosContainer.insertBefore(mediaElement, videosContainer.firstChild);
            if (e.type == 'local') {
                mediaElement.media.muted = true;
                mediaElement.media.volume = 0;
            }
        };
        connection.onstreamended = function(e) {
            if (e.mediaElement.parentNode && e.mediaElement.parentNode.parentNode && e.mediaElement.parentNode.parentNode.parentNode) {
                e.mediaElement.parentNode.parentNode.parentNode.removeChild(e.mediaElement.parentNode.parentNode);
            }
        };
        var setupNewSession = document.getElementById("setup-new-session");
        setupNewSession.onclick = function() {
            setupNewSession.disabled = true;
            var direction = document.getElementById('direction').value;
            var _session = document.getElementById('session').value;
            var splittedSession = _session.split('+');
            var session = {};
            for (var i = 0; i < splittedSession.length; i++) {
                session[splittedSession[i]] = true;
            }
            var maxParticipantsAllowed = 256;
            if (direction == 'one-to-one') maxParticipantsAllowed = 1;
            if (direction == 'one-to-many') session.broadcast = true;
            if (direction == 'one-way') session.oneway = true;
            var sessionName = document.getElementById('session-name').value;
            connection.extra = {
                'session-name': sessionName || 'Anonymous'
            };
            connection.session = session;
            connection.maxParticipantsAllowed = maxParticipantsAllowed;
            connection.sessionid = sessionName || 'Anonymous';
            connection.open();
        };
        connection.onmessage = function(e) {
            appendDIV(e.data);
            console.debug(e.userid, 'posted', e.data);
            console.log('latency:', e.latency, 'ms');
        };
        // on data connection gets open
        connection.onopen = function(e) {
            if (document.getElementById('open-new-session')) document.getElementById('open-new-session').disabled = true;
        };
       
        function updateLabel(progress, label) {
            if (progress.position == -1) return;
            var position = +progress.position.toFixed(2).split('.')[1] || 100;
            label.innerHTML = position + '%';
        }
        function appendDIV(div, parent) {
            if (typeof div === 'string') {
                var content = div;
                div = document.createElement('div');
                div.innerHTML = content;
            }
            div.tabIndex = 0;
            div.focus();
        }

    
        connection.connect();