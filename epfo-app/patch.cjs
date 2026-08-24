const fs = require('fs');
let content = fs.readFileSync('src/pages/Onboarding.tsx', 'utf8');
content = content.replace(/className='space-y-6'/g, "className='space-y-6 my-auto'");
content = content.replace(/className='space-y-6 text-center'/g, "className='space-y-6 my-auto text-center'");
content = content.replace(/className='flex-1 p-6 flex flex-col justify-start pb-12 pt-16 max-w-md mx-auto w-full min-h-max'/g, "className='flex-1 p-6 flex flex-col pb-12 max-w-md mx-auto w-full min-h-[min-content]'");
fs.writeFileSync('src/pages/Onboarding.tsx', content);
