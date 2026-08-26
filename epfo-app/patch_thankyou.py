import re

# 1. Update AssistantAvatar.tsx
with open('src/components/ui/AssistantAvatar.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Add Heart to lucide-react import
content = content.replace("Settings, CheckCircle2", "Settings, CheckCircle2, Heart")

# Add thank_you to eyeVariants
content = content.replace("success: { x: '0%', y: '-10%', transition: { duration: 0.2 } }", "success: { x: '0%', y: '-10%', transition: { duration: 0.2 } },\n    thank_you: { x: '0%', y: '-10%', transition: { duration: 0.2 } }")

# Add Heart Scene
heart_scene = """
        {/* SCENE: Thank You (Heart) */}
        {state === 'thank_you' && (
          <motion.div
            key="thank-you-prop"
            initial={{ scale: 0, y: 5 }}
            animate={{ scale: [1, 1.2, 1], y: [0, -5, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute -top-[50%] -right-[30%] z-30"
          >
            <Heart className="w-[120%] h-[120%] text-red-500 fill-red-500" />
          </motion.div>
        )}
"""
# Replace ONLY the first </AnimatePresence> which belongs to scenery, not the blush ones
content = content.replace("      </AnimatePresence>", heart_scene + "\n      </AnimatePresence>", 1)

# Update eyes squints and blushes
content = content.replace("state === 'success'", "(state === 'success' || state === 'thank_you')")

with open('src/components/ui/AssistantAvatar.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

# 2. Update SmartFlowEngine.tsx
with open('src/pages/workflows/SmartFlowEngine.tsx', 'r', encoding='utf-8') as f:
    engine_content = f.read()

# Since the string in SmartFlowEngine might have weird characters for emojis, let's use regex
engine_content = re.sub(
    r"<div className='bg-blue-50 border border-blue-100 p-5 rounded-2xl text-center'>[\s\S]*?</div>",
    r"""<div className='bg-blue-50 border border-blue-100 p-6 rounded-2xl flex flex-col items-center justify-center gap-2 shadow-inner'>
                <AssistantAvatar state='thank_you' className='!w-12 !h-12 mb-2 shadow-md' />
                <p className='font-bold text-blue-900 text-lg'>Thank you!</p>
                <p className='text-sm text-blue-700'>Your feedback has been recorded.</p>
              </div>""",
    engine_content
)

with open('src/pages/workflows/SmartFlowEngine.tsx', 'w', encoding='utf-8') as f:
    f.write(engine_content)
