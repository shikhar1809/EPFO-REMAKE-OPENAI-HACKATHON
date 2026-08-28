# EPFO Smart Flows Documentation

The AI agent in the Smart Flow system has the capability to handle the following specific EPFO-related tasks. If a user's request matches one or more of these intents, the agent will dynamically generate a plan and guide the user through the process.

## Available Flows

1. **kyc_mismatch**
   - **Description**: Fixing KYC mismatch, updating Name or Date of Birth (DOB) issues, updating nominee details, bank account seeding, or updating IFSC code.
   - **Keywords/Intents**: kyc, mismatch, name correction, dob correction, nominee, bank seed, ifsc.

2. **aadhaar_fix**
   - **Description**: Resolving Aadhaar linking conflicts where an Aadhaar is linked to multiple or incorrect UANs.
   - **Keywords/Intents**: aadhaar conflict, aadhaar link issue.

3. **withdraw_pf**
   - **Description**: Withdrawing Provident Fund (PF) money, filing a claim, requesting a Medical Advance, submitting Form 31, Form 19, or Form 10C.
   - **Keywords/Intents**: withdraw, claim, advance, settle pf, form 31, form 19, form 10c, medical emergency.

4. **transfer_pf**
   - **Description**: Transferring PF balance from an old employer or previous account to the current active account.
   - **Keywords/Intents**: transfer pf, old account, previous employer.

5. **merge_accounts**
   - **Description**: Merging multiple UANs, resolving duplicate UAN issues, or consolidating inactive accounts into a single active UAN.
   - **Keywords/Intents**: merge, consolidate, duplicate uan, multiple uan.

6. **mark_exit**
   - **Description**: Marking the Date of Exit (DOE), updating employment leaving status, resigning, or quitting a job.
   - **Keywords/Intents**: exit, leaving, resign, quit, date of exit.

7. **life_certificate**
   - **Description**: Submitting a Digital Life Certificate (Jeevan Pramaan) or pension certificate.
   - **Keywords/Intents**: life certificate, pramaan, jeevan, pension cert.

8. **grievance**
   - **Description**: Filing a grievance, raising a complaint, or inquiring about why a claim was rejected.
   - **Keywords/Intents**: grievance, complain, complaint, reject.

## Fallback
If the user's request does not fall into one of the above categories, the AI agent will respond with: "no cant help use traditional flow".
