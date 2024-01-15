let mediaRecorder;
        let recordedChunks = [];

        const searchButton = document.getElementById('search-button');
        const videoContainer = document.getElementById('video-container');
        const recordButton = document.getElementById('record-button');
        const searchInput = document.getElementById('search');
        const mediaContainer = document.getElementById('media-container');
        const fileInput = document.getElementById('file-input');
        let mediaCounter = 1;

        searchButton.addEventListener('click', function() {
            const videoUrl = searchInput.value.trim();
            const videoId = getVideoId(videoUrl);

            if (videoId !== '') {
                const iframe = document.createElement('iframe');
                iframe.width = '100%';
                iframe.height = '450';
                iframe.src = `https://www.youtube.com/embed/${videoId}`;

                // Clear previous video
                videoContainer.innerHTML = '';

                // Append the iframe to the video container
                videoContainer.appendChild(iframe);
            } else {
                alert('Please enter a valid YouTube video URL or video ID.');
            }
        });

        recordButton.addEventListener('click', async () => {
            try {
                const stream = await navigator.mediaDevices.getDisplayMedia({ video: { mediaSource: 'screen' } });
                mediaRecorder = new MediaRecorder(stream);

                mediaRecorder.ondataavailable = event => {
                    if (event.data.size > 0) {
                        recordedChunks.push(event.data);
                    }
                };

                mediaRecorder.onstop = () => {
                    const blob = new Blob(recordedChunks, { type: 'video/webm' });
                    const url = URL.createObjectURL(blob);
                    window.open(url, '_blank');
                    recordedChunks = [];
                };

                mediaRecorder.start();
                recordButton.disabled = true;
                recordButton.textContent = 'Recording...';
            } catch (error) {
                console.error('Error accessing screen capture:', error);
                alert('Screen recording is not supported in your browser.');
            }
        });

        fileInput.addEventListener('change', () => {
            const files = fileInput.files;
            if (files.length > 0) {
                for (const file of files) {
                    const mediaItem = document.createElement(getMediaType(file.type));
                    mediaItem.src = URL.createObjectURL(file);
                    mediaItem.alt = `Media ${mediaCounter}`;
                    mediaItem.classList.add('media-item');

                    mediaContainer.appendChild(mediaItem);
                    mediaCounter++;
                }

                fileInput.value = ''; // Clear the file input after processing
            }
        });

        function getMediaType(fileType) {
            if (fileType.startsWith('image/')) {
                return 'img';
            } else if (fileType.startsWith('video/')) {
                return 'video';
            } else {
                return 'div'; // Default to a generic container for unsupported types
            }
        }

        function getVideoId(url) {
            const videoIdRegex = /[?&]v=([^&#]+)/;
            const match = url.match(videoIdRegex);
            if (match && match[1]) {
                return match[1];
            } else {
                // Check if it's a valid live video link
                const liveVideoRegex = /\/live\/([^?]+)/;
                const liveMatch = url.match(liveVideoRegex);
                if (liveMatch && liveMatch[1]) {
                    return liveMatch[1];
                } else {
                    return '';
                }
            }
        }
