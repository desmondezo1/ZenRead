document.addEventListener('DOMContentLoaded', function () {
    var toggleButton = document.getElementById('toggleButton');

    // Check the current state and update the button
    chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
        chrome.tabs.sendMessage(tabs[0].id, { action: 'getState' }, function(response) {
            if (response && response.zenReadEnabled) {
                toggleButton.classList.add('active');
            }
        });
    });

    toggleButton.addEventListener('click', function () {
        var isActive = toggleButton.classList.contains('active');
        toggleButton.classList.toggle('active', !isActive);

        chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
            chrome.tabs.sendMessage(tabs[0].id, { action: 'toggleZenRead' });
        });
    }, false);
});
