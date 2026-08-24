

export const Watermark = () => {
  return (
    <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none select-none">
      <img 
        src="/epfo-bg.png" 
        alt="EPFO Background" 
        className="w-full h-full object-cover opacity-50"
      />
    </div>
  );
};
