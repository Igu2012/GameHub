let installEvent = null;

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault(); 
  installEvent = e;
});

document.addEventListener('click', async () => {
  if (installEvent) {
    installEvent.prompt();

    const result = await installEvent.userChoice;
    
    if (result.outcome === 'accepted') {
      console.log('The user installed the app!');
    } else {
      console.log('The user declined the installation.');
    }

    installEvent = null;
  }
});
