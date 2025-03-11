module.exports = (client) => {
    process.on('uncaughtException', (error) => {
        console.error('Unhandled Exception:', error);
        
        
        
    });

    process.on('unhandledRejection', (reason, promise) => {
        console.warn('Unhandled Rejection at:', promise, 'reason:', reason);
        
        
        
    });
};
