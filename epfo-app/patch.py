import sys
import re

with open('src/pages/Home.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# We will replace the 'Quick routes for specialized flows' block in handleAgenticStart.
pattern = re.compile(r"""      // Quick routes for specialized flows
      if \(lower\.includes\('life'\) \|\| lower\.includes\('certificate'\) \|\| lower\.includes\('pramaan'\)\) \{
        setChatInput\(''\);
        navigate\('/life-certificate'\);
        return;
      \}

      if \(lower\.includes\('exit'\) \|\| lower\.includes\('leaving'\) \|\| lower\.includes\('quit'\)\) \{
        setChatInput\(''\);
        navigate\('/mark-exit'\);
        return;
      \}

      const taskType = lower\.includes\('withdraw'\) \|\| lower\.includes\('advance'\) \|\| lower\.includes\('claim'\) \? 'withdraw_pf' : 
                       \(lower\.includes\('transfer'\) \|\| lower\.includes\('merge'\)\) \? 'transfer_pf' : 'general_inquiry';
      
      let plan: any\[\] = \[\];
      if \(taskType === 'withdraw_pf'\) \{
        plan = \[
          \{ step: 'verify_identity', description: 'Verify your identity securely', status: 'active' as const \},
          \{ step: 'check_eligibility', description: 'Check advance / final claim eligibility', status: 'pending' as const \},
          \{ step: 'gather_documents', description: 'Fetch KYC & Bank details from DigiLocker', status: 'pending' as const \},
          \{ step: 'review_claim', description: 'Review claim purpose & amount', status: 'pending' as const \},
          \{ step: 'submit_claim', description: 'Aadhaar OTP sign & final submission', status: 'pending' as const \},
        \];
      \} else if \(taskType === 'transfer_pf'\) \{
        plan = \[
          \{ step: 'verify_identity', description: 'Verify your identity securely', status: 'active' as const \},
          \{ step: 'fetch_employment', description: 'Locate previous Member IDs & establishments', status: 'pending' as const \},
          \{ step: 'initiate_transfer', description: 'Authorize transfer to current account', status: 'pending' as const \},
          \{ step: 'submit_transfer', description: 'Attestation & OTP submission', status: 'pending' as const \},
        \];
      \} else \{
        plan = \[
          \{ step: 'verify_identity', description: 'Verify your identity securely', status: 'active' as const \},
          \{ step: 'process_inquiry', description: 'Analyze your request & calculate rules', status: 'pending' as const \},
          \{ step: 'resolve_inquiry', description: 'Provide accurate guidance or grievance path', status: 'pending' as const \}
        \];
      \}""", re.DOTALL)


replacement = """      let taskType = 'general_inquiry';
      
      if (lower.includes('life') || lower.includes('certificate') || lower.includes('pramaan')) {
        taskType = 'life_certificate';
      } else if (lower.includes('exit') || lower.includes('leaving') || lower.includes('quit')) {
        taskType = 'mark_exit';
      } else if (lower.includes('withdraw') || lower.includes('advance') || lower.includes('claim')) {
        taskType = 'withdraw_pf';
      } else if (lower.includes('transfer') || lower.includes('merge')) {
        taskType = 'transfer_pf';
      } else if (lower.includes('grievance') || lower.includes('complaint') || lower.includes('reject')) {
        taskType = 'grievance';
      }

      let plan: any[] = [];
      if (taskType === 'withdraw_pf') {
        plan = [
          { step: 'verify_identity', description: 'Verify your identity securely', status: 'active' as const },
          { step: 'check_eligibility', description: 'Check advance / final claim eligibility', status: 'pending' as const },
          { step: 'gather_documents', description: 'Fetch KYC & Bank details from DigiLocker', status: 'pending' as const },
          { step: 'review_claim', description: 'Review claim purpose & amount', status: 'pending' as const },
          { step: 'submit_claim', description: 'Aadhaar OTP sign & final submission', status: 'pending' as const },
        ];
      } else if (taskType === 'transfer_pf') {
        plan = [
          { step: 'verify_identity', description: 'Verify your identity securely', status: 'active' as const },
          { step: 'fetch_employment', description: 'Locate previous Member IDs & establishments', status: 'pending' as const },
          { step: 'initiate_transfer', description: 'Authorize transfer to current account', status: 'pending' as const },
          { step: 'submit_transfer', description: 'Attestation & OTP submission', status: 'pending' as const },
        ];
      } else if (taskType === 'life_certificate') {
        plan = [
          { step: 'verify_identity', description: 'Verify pensioner identity', status: 'active' as const },
          { step: 'fetch_pension_details', description: 'Retrieve PPO and bank details', status: 'pending' as const },
          { step: 'capture_face', description: 'Perform UIDAI face authentication', status: 'pending' as const },
          { step: 'submit_certificate', description: 'Generate & submit Jeevan Pramaan', status: 'pending' as const }
        ];
      } else if (taskType === 'mark_exit') {
        plan = [
          { step: 'verify_identity', description: 'Verify your identity securely', status: 'active' as const },
          { step: 'fetch_employment', description: 'Retrieve employment records', status: 'pending' as const },
          { step: 'select_exit_reason', description: 'Select establishment and reason for exit', status: 'pending' as const },
          { step: 'submit_exit', description: 'Aadhaar OTP sign & confirm exit', status: 'pending' as const }
        ];
      } else if (taskType === 'grievance') {
        plan = [
          { step: 'verify_identity', description: 'Verify your identity securely', status: 'active' as const },
          { step: 'analyze_issue', description: 'Analyze rejection reason or delay', status: 'pending' as const },
          { step: 'register_grievance', description: 'Register EPFiGMS ticket automatically', status: 'pending' as const },
          { step: 'generate_reference', description: 'Generate tracking reference number', status: 'pending' as const }
        ];
      } else {
        plan = [
          { step: 'verify_identity', description: 'Verify your identity securely', status: 'active' as const },
          { step: 'process_inquiry', description: 'Analyze your request & calculate rules', status: 'pending' as const },
          { step: 'resolve_inquiry', description: 'Provide accurate guidance or grievance path', status: 'pending' as const }
        ];
      }"""

new_content = pattern.sub(replacement, content)
if new_content == content:
    print('Pattern not found')
else:
    with open('src/pages/Home.tsx', 'w', encoding='utf-8') as f:
        f.write(new_content)
    print('Success')
