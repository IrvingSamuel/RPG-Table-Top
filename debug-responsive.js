// Debug script para monitorar responsividade
// Adicione este script temporariamente ao final do main.js para debug

console.log('=== DEBUG RESPONSIVIDADE ===');

function logScreenInfo() {
    console.log('Informações da tela:');
    console.log('Window dimensions:', window.innerWidth, 'x', window.innerHeight);
    console.log('Screen dimensions:', screen.width, 'x', screen.height);
    console.log('Device pixel ratio:', window.devicePixelRatio);
    console.log('Mobile detected:', detectMob());
    
    const dims = getResponsiveDimensions();
    console.log('Calculated canvas dimensions:', dims.width, 'x', dims.height);
    
    if (game && game.scale) {
        console.log('Phaser canvas dimensions:', game.scale.width, 'x', game.scale.height);
    }
    
    console.log('Canvas variables (cw, ch):', cw, 'x', ch);
    console.log('Zoom level:', zoom);
    console.log('---');
}

// Log inicial
logScreenInfo();

// Log quando redimensionar
const originalResize = resizeGame;
resizeGame = function() {
    console.log('Redimensionando...');
    logScreenInfo();
    originalResize();
    setTimeout(() => {
        console.log('Após redimensionamento:');
        logScreenInfo();
    }, 100);
};

// Log periódico para debug
setInterval(() => {
    if (window.debugResponsive) {
        logScreenInfo();
    }
}, 5000);

// Ativar debug com: window.debugResponsive = true; no console
window.debugResponsive = false;