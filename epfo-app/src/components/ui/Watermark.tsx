import React from 'react';
import { Building2, Users, Shield, Landmark } from 'lucide-react';

export const Watermark = () => (
  <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none select-none flex items-center justify-center opacity-[0.03]">
    {/* Large government building / EPFO representation */}
    <Landmark className="absolute -right-20 top-20 w-96 h-96 text-epfo-blue rotate-12" strokeWidth={1} />
    
    {/* Users / Family representation */}
    <Users className="absolute -left-20 bottom-20 w-80 h-80 text-epfo-orange -rotate-12" strokeWidth={1} />
    
    {/* Security / Vault representation */}
    <Shield className="absolute right-10 -bottom-10 w-72 h-72 text-slate-900 rotate-6" strokeWidth={1} />
  </div>
);
