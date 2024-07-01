window.onload = async () => {

    const POSAuthenticationToken = localStorage.getItem('POSAuthenticationToken');


    if (POSAuthenticationToken) {
        const isInternetAvailable = checkInternetConnection();
        if (isInternetAvailable) {
            const requestBody = {
                token: POSAuthenticationToken
            };

            try {
                const response = await fetch('http://localhost:3000/pos-authenticate', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(requestBody)
                });

                if (!response.ok) {
                    const errorMessage = await response.text();
                    throw new Error(`Authentication failed: ${errorMessage}`);
                }

                const data = await response.json();

                localStorage.setItem("POSAuthenticationToken", data.token);

                showSalePersonAuthScreen();

            } catch (error) {
                console.error('Error during authentication:', error.message);
                showMenuAndCategory(menuItems);
            } finally {
                hideLoader();
            }
        } else {
            // if no internet but menu and token is availe then continue with the offline mode
            showPosInitialLoginScreen();
            hideLoader();
        }
    } else {
        showPosInitialLoginScreen();
        hideLoader();
    }

}

document.addEventListener('DOMContentLoaded', function() {
    const rightAside = document.getElementById('rightAside');
    const rightAsideHandle = document.getElementById('rightAsideHandle');
    
    let isResizing = false;

    rightAsideHandle.addEventListener('mousedown', function(e) {
        isResizing = true;
        document.addEventListener('mousemove', resize, false);
        document.addEventListener('mouseup', stopResize, false);
    });

    function resize(e) {
        if (isResizing) {
            const newWidth = window.innerWidth - e.clientX;
            rightAside.style.width = newWidth + 'px';
        }
    }

    function stopResize() {
        isResizing = false;
        document.removeEventListener('mousemove', resize, false);
        document.removeEventListener('mouseup', stopResize, false);
    }
});
