import React, {
    FC,
    useState,
    useRef,
    useCallback,
    useEffect,
    memo,
    useMemo,
} from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    Animated,
    ScrollView,
    ListRenderItem,
    Image,
} from 'react-native';
import { useUserRole } from '../../../../../../hooks/useUserRole';
import { makeBubbleStyles, makeDotsStyles, makeOptStyles, makeScreenStyles } from './OfflineChatScreen.styles';
import { ICONS } from '../../../../../../utils/Images';
import { RoleTheme } from '../../../../../../types/roleManager.types';


interface IChatMessage {
    id: string;
    text: string;
    isUser: boolean;
    timestamp: Date;
}

interface IConvoNode {
    id: string;
    botMessage: string;
    options: IConvoOption[];
}

interface IConvoOption {
    label: string;
    nextNodeId?: string;
    answer?: string;
}


const CONVERSATION_TREE: Record<string, IConvoNode> = {

    root: {
        id: 'root',
        botMessage: "Hi! I'm the NCHRG Assistant What can I help you with today? Pick a topic to get started.",
        options: [
            { label: 'Account & Login', nextNodeId: 'account' },
            { label: 'App Features & Modules', nextNodeId: 'features' },
            { label: 'Connections & Sharing', nextNodeId: 'connections' },
            { label: 'Reminders', nextNodeId: 'reminders' },
            { label: 'Troubleshooting', nextNodeId: 'troubleshooting' },
            { label: 'Personal vs Business Mode', nextNodeId: 'modes' },
            { label: 'Privacy, Security & Subscription', nextNodeId: 'privacy' },
        ],
    },

    // ACCOUNT & LOGIN
    account: {
        id: 'account',
        botMessage: "Sure! What's the account or login issue you're facing?",
        options: [
            { label: 'How do I sign up?', nextNodeId: 'account_signup' },
            { label: 'I forgot my password', nextNodeId: 'account_forgot_password' },
            { label: 'I can\'t log in', nextNodeId: 'account_login' },
            { label: 'Update my profile', nextNodeId: 'account_profile' },
            { label: 'OTP / Verification issues', nextNodeId: 'account_otp' },
            { label: 'Delete or deactivate my account', nextNodeId: 'account_delete' },
            { label: 'Change my password', nextNodeId: 'account_change_password' },
        ],
    },

    account_signup: {
        id: 'account_signup',
        botMessage: "What part of signing up do you need help with?",
        options: [
            {
                label: "What information do I need to register?",
                answer: "To create your NCHRG account you'll need:\n\n**Required fields:**\n- **Full Name**\n- **Username**\n- **Email** (valid format)\n- **Phone Number** (with country code)\n- **Password** (minimum 6 characters)\n- **Confirm Password** (must match)\n- Accept the **Terms & Privacy Policy** checkbox\n\nAfter submitting, you'll verify your **email** with a 7-digit OTP, then verify your **phone number** with another 7-digit OTP. Each code has a 60-second resend cooldown.",
            },
            {
                label: "What happens after I verify my email and phone?",
                answer: "After verifying both your email and phone number, you'll go through these setup steps:\n\n1. **Choose a Plan** — Select Free or Premium\n2. **Privacy & Health Data Consent** — Three toggles (Health Data Collection, Health Data Sharing, Analytics & Crash Reporting). Each requires explicit consent via a checkbox\n3. **Set Up Identity Hub** — Upload your ID via camera or enter details manually\n4. **Personal Information** — Name, date of birth, address, country, etc.\n5. **Driver's License** — License number, state, expiry, class\n6. **Passport** — Passport number, country, expiry, type\n7. **Licenses & Certifications** — Professional or trade licenses\n\nAll steps from Identity Hub onwards can be **skipped** — you can complete them later from the app.",
            },
            {
                label: "I didn't receive my email OTP",
                answer: "If you haven't received your email verification code:\n\n1. **Check your spam/junk folder** — it sometimes lands there\n2. Wait up to **60 seconds** before requesting a resend\n3. Tap **\"Resend OTP\"** on the verification screen\n4. If your email address was entered incorrectly, tap **\"Change Email\"** on the same screen to correct it\n\nThe code is a **7-digit number**. If issues persist after multiple attempts, try registering with a different email address.",
            },
            {
                label: "I didn't receive my phone OTP",
                answer: "If your phone verification code isn't arriving:\n\n1. Make sure your **phone number and country code** are correct\n2. Wait up to **60 seconds** — there's a resend cooldown\n3. Tap **\"Resend OTP\"** once the timer expires\n4. If the number was wrong, tap **\"Change Phone Number\"** on the verification screen\n\nThe code is a **7-digit number** sent via SMS.",
            },
            {
                label: "What are the Free vs Premium plan differences?",
                answer: "NCHRG offers two subscription plans:\n\n**Free Plan:**\n- Access to basic features across 3 feature tiers\n\n**Premium Plan:**\n- Extended features across 5 feature tiers\n- Price is displayed dynamically in the app\n\nYou choose your plan during onboarding on the **Choose Plan** screen. You can also upgrade later via **Account → Subscription Plan → Choose Plan**.\n\n*Note: The exact pricing is shown live in the app as it's fetched from the server.*",
            },
        ],
    },

    account_forgot_password: {
        id: 'account_forgot_password',
        botMessage: "No worries! Here's how the password reset works. What do you need?",
        options: [
            {
                label: "Walk me through resetting my password",
                answer: "Here's how to reset a forgotten password:\n\n1. On the **Login screen**, tap **\"Forgot Password\"**\n2. Enter your **username**\n3. A **7-digit OTP** will be sent to your registered email address\n4. Enter the OTP on the verification screen\n5. Set a **new password** (minimum 6 characters)\n6. Enter it again in **Confirm Password** (must match)\n7. Tap **Save** — you'll be logged in automatically\n\nIf you don't receive the OTP, check your spam folder or wait 60 seconds and resend.",
            },
            {
                label: "I know my password but want to change it",
                answer: "To change your existing password while logged in:\n\n1. Go to the **Account** tab\n2. Tap **Update Password**\n3. Enter your **Current Password**\n4. Enter your **New Password** (minimum 8 characters)\n5. Enter it again in **Confirm Password**\n6. Tap **Save**\n\n⚠️ Note: The minimum password length for updates is **8 characters**, which is slightly stricter than the 6-character minimum at signup.",
            },
        ],
    },

    account_change_password: {
        id: 'account_change_password',
        botMessage: "To change your password while logged in:",
        options: [
            {
                label: "Show me the steps",
                answer: "Here's how to update your password:\n\n1. Go to the **Account** tab\n2. Tap **Update Password**\n3. Enter your **Current Password**\n4. Enter your **New Password** — must be at least **8 characters**\n5. Re-enter it in **Confirm Password** (must match exactly)\n6. Tap **Save**\n\nYour password is updated immediately. You won't be logged out.",
            },
        ],
    },

    account_login: {
        id: 'account_login',
        botMessage: "What happens when you try to log in?",
        options: [
            {
                label: "It says my password is incorrect",
                answer: "If you're getting an incorrect password error:\n\n1. Double-check you're entering the right **username** (not your email)\n2. Check **Caps Lock** isn't on\n3. Try using **Google Sign-In** or **Apple Sign-In** if you originally signed up that way\n4. If you've forgotten it, tap **\"Forgot Password\"** on the Login screen and reset via email OTP\n\nApple Sign-In is available on **iOS only**. Google Sign-In is available on both **iOS and Android**.",
            },
            {
                label: "My email or phone isn't verified yet",
                answer: "If your account isn't fully verified, NCHRG will route you back to the appropriate verification step when you log in:\n\n- **Email not verified** → you'll be taken to the Email OTP screen\n- **Phone not verified** → you'll be taken to the Phone OTP screen\n- **Setup not complete** → you'll continue from where you left off in the onboarding flow\n\nCheck your spam folder for the OTP, or tap **Resend OTP** after the 60-second cooldown.",
            },
            {
                label: "I can't remember my username",
                answer: "NCHRG uses your **username** (not your email) to log in. If you've forgotten it:\n\n- Try the username you set during signup\n- It's not the same as your email address\n- Unfortunately, the app doesn't currently offer a \"find my username\" feature via the login screen\n\nIf you're completely locked out, please contact **NCHRG support** through the app's support channel for further assistance.",
            },
            {
                label: "I want to use Google or Apple Sign-In",
                answer: "NCHRG supports social sign-in:\n\n- **Google Sign-In** — available on both **iOS and Android**\n- **Apple Sign-In** — available on **iOS only**\n\nBoth options appear as buttons on the **Login screen**. Tap the one you used when you originally signed up — using a different method than your original signup may create a separate account.",
            },
        ],
    },

    account_profile: {
        id: 'account_profile',
        botMessage: "What would you like to update on your profile?",
        options: [
            {
                label: "Update my full name",
                answer: "To update your display name:\n\n1. Go to the **Account** tab\n2. Tap **Personal Information**\n3. Edit the **Full Name** field\n4. Tap **Save**\n\nYour full name is editable from this screen.",
            },
            {
                label: "Why can't I change my email or phone?",
                answer: "Your **email** and **phone number** are shown as **read-only** in the Personal Information screen. This is because they were verified during signup and are tied to your account's authentication and OTP delivery.\n\nIf you need to change them, please contact **NCHRG support** for assistance with account-level changes.",
            },
            {
                label: "Change my app language",
                answer: "To change the app language:\n\n1. Go to the **Account** tab\n2. Tap **Languages**\n3. Select from any of the **20 supported languages**\n\nNCHRG supports: English, Arabic, Spanish, French, German, Portuguese, Chinese (Simplified), Japanese, Korean, Hindi, Russian, Italian, Dutch, Polish, Turkish, Thai, Indonesian, Vietnamese, Hebrew, and Urdu.\n\n⚠️ **RTL languages** (Arabic, Hebrew, Urdu) flip the entire UI layout. A **full app restart** may be required for the change to take full effect.",
            },
            {
                label: "Change my colour theme",
                answer: "You can personalise the app's colour per mode:\n\n1. Go to the **Account** tab\n2. Tap **Change Colour Preference**\n3. Use the **colour picker and hue slider** to choose your preferred colour\n4. The screen shows a **live preview** of how it will look\n5. Tap **Save** to apply, or **Reset** to go back to the default\n\nYou can set a separate colour for **Personal Mode** and **Business Mode**.",
            },
        ],
    },

    account_otp: {
        id: 'account_otp',
        botMessage: "Which OTP issue are you experiencing?",
        options: [
            {
                label: "Email OTP not arriving",
                answer: "If your email OTP isn't arriving:\n\n1. **Check your spam/junk folder** — this is the most common cause\n2. The OTP is a **7-digit code** — make sure you're looking for the right format\n3. Wait up to **60 seconds** before the Resend button becomes active\n4. Tap **Resend OTP** to request a new code\n5. If your email was entered incorrectly, tap **\"Change Email\"** on the verification screen\n\nIf the problem persists, try a different email provider.",
            },
            {
                label: "Phone OTP not arriving",
                answer: "If your SMS OTP isn't arriving:\n\n1. Confirm your **phone number and country code** are correct\n2. Wait up to **60 seconds** for the message to arrive\n3. Tap **Resend OTP** after the cooldown\n4. If the number is wrong, tap **\"Change Phone Number\"** on the verification screen\n5. Make sure your phone has **SMS signal** — try toggling airplane mode off and on\n\nThe OTP is a **7-digit number** sent via SMS.",
            },
        ],
    },

    account_delete: {
        id: 'account_delete',
        botMessage: "Just to confirm — are you looking to permanently delete or do something else?",
        options: [
            {
                label: "Permanently delete my account",
                answer: "To permanently delete your NCHRG account:\n\n1. Go to the **Account** tab\n2. Scroll to the bottom and tap **Delete Account**\n3. Confirm the deletion when prompted\n\n⚠️ **This action is irreversible.** All your personal data, records, and connections will be removed. We recommend exporting your data first via **Account → Request Access to Data** (GDPR export).\n\nIf you're having trouble with the process, contact NCHRG support.",
            },
            {
                label: "Request my data before deleting (GDPR)",
                answer: "Before deleting, you can request a copy of your data:\n\n1. Go to **Account** → **Request Access to Data**\n2. Choose:\n   - **Request Type**: Access Copy, Confirm Collection, or Both\n   - **Data Category**: All, Health, Financial, or Other\n   - **Preferred Format**: In-App, Email, or Other\n   - Add any **Additional Details**\n3. Submit the request\n\nYou can also submit a **deletion request** via **Account → Request Deletion of Data**, where you can choose to delete all data or specific categories.",
            },
            {
                label: "Log out instead",
                answer: "To log out without deleting your account:\n\n1. Go to the **Account** tab\n2. Tap **Logout**\n3. Confirm\n\nThis clears your session tokens and returns you to the login screen. All your data remains safely stored and will be available when you log back in.",
            },
        ],
    },

    features: {
        id: 'features',
        botMessage: "NCHRG has a lot of modules! Which area would you like to explore?",
        options: [
            { label: 'Identity Hub', nextNodeId: 'feat_identity' },
            { label: 'Health Tracker', nextNodeId: 'feat_health' },
            { label: 'Vehicles', nextNodeId: 'feat_vehicles' },
            { label: 'Real Estate', nextNodeId: 'feat_realestate' },
            { label: 'Banking, Loans & Finance', nextNodeId: 'feat_banking' },
            { label: 'Other Modules', nextNodeId: 'feat_other' },
            { label: 'Favourites & Home Dashboard', nextNodeId: 'feat_favourites' },
            { label: 'Search', nextNodeId: 'feat_search' },
            { label: 'AI Assistant', nextNodeId: 'feat_ai' },
            { label: 'Business Mode Modules', nextNodeId: 'feat_business_modules' },
        ],
    },

    feat_identity: {
        id: 'feat_identity',
        botMessage: "The Identity Hub stores all your key personal documents. What do you want to know?",
        options: [
            {
                label: "What can I store in Identity Hub?",
                answer: "The **Identity Hub** has four sections:\n\n1. **Personal Information** — Name, date of birth, phone, email, address, country, city, state, zip\n2. **Passport** — Passport number, country, expiry date, type (Book or Card), image, Add to Wallet toggle, reminder\n3. **Driver's License** — License number, state, expiry, class (A/B/C/D/E/M), image, Add to Wallet toggle, reminder\n4. **Licenses & Certifications** — Type (Professional, Trade, Certification, Government, Healthcare, Financial, Education, Other), license number, jurisdiction, issuer/authority, expiry, image, Add to Wallet toggle, reminder\n\nYou can add **multiple licenses & certifications**. All sections support viewing, adding, editing, deleting, sharing, and edit history.\n\n**Navigation:** Home → Identity Hub",
            },
            {
                label: "How do expiration reminders work for documents?",
                answer: "When you add a **Passport**, **Driver's License**, or **License/Certification**, you can set a **\"Remind Before\"** value — the number of days before expiry you want to be reminded.\n\nThe **default is 90 days**, but you can change it to any number.\n\nThe reminder will appear automatically in your **Reminders** tab under Upcoming, Due Today, or Past Due depending on the date. No manual reminder setup needed — it's automatic once the document is saved.",
            },
            {
                label: "What is 'Add to Wallet'?",
                answer: "The **Add to Wallet** toggle (available on Passport, Driver's License, and Licenses/Certifications) adds that document to your **Wallet module**.\n\nThe Wallet is a digital hub that aggregates your identity documents and financial cards in one place for easy access.\n\n**Navigation:** Home → Wallet\n\nYou can also add documents to the Wallet directly from the Wallet screen, where it supports: Driving License, Passport, ID Card, and Insurance Card types.",
            },
            {
                label: "How do I share my identity documents?",
                answer: "You can share Identity Hub records with your Connections:\n\n1. Go to **Home → Identity Hub**\n2. Tap the **Share** button — you can share an entire section (e.g., all Passports) or a specific record\n3. Select the connection you want to share with\n4. Choose the permission level: **View** (read-only) or **Edit** (can make changes)\n\nThe recipient will see your shared records under **Connections → [Your Name] → Shared With You**.\n\nMake sure the person is already in your Connections before sharing.",
            },
        ],
    },

    feat_health: {
        id: 'feat_health',
        botMessage: "The Health Tracker helps you manage health records for yourself and dependents. What do you need?",
        options: [
            {
                label: "What can I track in Health Tracker?",
                answer: "The **Health Tracker** lets you manage health records for yourself and any children/dependents. Each patient has these sections:\n\n- **Overview** — Blood type (A+/A-/B+/B-/AB+/AB-/O+/O-), diagnoses, allergies, surgeries\n- **Caregivers** — Name, relation, phone, email, NCHRG username\n- **Medications** — Name, type (Tablet/Capsule/Liquid/Injection/Cream/Inhaler), dosage, unit (Mg/ML/G/Units), schedule, start/end dates, RX number, refill date, prescriber, pharmacy, side effects, reminder toggle, image\n- **Doctors** — Name, specialisation, NPI ID, clinic, phone, website, email, address\n- **Appointments** — Date, time, doctor, reason, location, address, reminder, image, next steps/tasks\n\n**Navigation:** Home → Health Tracker\n\n⚕️ *The Health Tracker is for record-keeping only. For medical advice, please consult your doctor.*",
            },
            {
                label: "How do I add a child or dependent?",
                answer: "To add a child or dependent to Health Tracker:\n\n1. Go to **Home → Health Tracker**\n2. Tap the **+** button\n3. Select **\"Add Child\"**\n4. Enter their **name** and **date of birth**\n5. Tap **Save**\n\nAfter adding, their tab will appear alongside yours. You can switch between patient tabs to view and manage each person's records separately.",
            },
            {
                label: "How do I add a medication?",
                answer: "To add a medication for a patient:\n\n**Step 1 — Add a doctor first** (required for the prescriber field):\n1. In Health Tracker, select the patient's tab\n2. Expand **Doctors** → tap **+**\n3. Fill in: Name, Specialisation, NPI ID, Clinic Name, Phone, Website, Email, Address (all required)\n\n**Step 2 — Add the medication:**\n1. Expand **Medications** → tap **+**\n2. Fill in:\n   - **Name** (required)\n   - Type: Tablet, Capsule, Liquid, Injection, Cream, or Inhaler\n   - Dose + Unit (Mg / ML / G / Units)\n   - Schedule: Specific Times, As Needed, or With Meals\n   - Start & End Dates\n   - RX Number, Refill Date\n   - **Prescriber** (dropdown from your added doctors)\n   - Pharmacy details, side effects\n   - Toggle **Reminder** for alerts\n3. Tap **Save**",
            },
            {
                label: "How do I add a doctor's appointment?",
                answer: "To log an appointment:\n\n1. Go to **Home → Health Tracker**\n2. Select the patient's tab\n3. Expand the **Appointments** section\n4. Tap **+**\n5. Fill in:\n   - **Date** (required)\n   - **Time** (required)\n   - **Doctor** — dropdown from doctors you've added (required)\n   - **Reason** (required)\n   - Location, Address (optional)\n   - Toggle **Reminder** if you want a reminder\n   - Upload an image (optional)\n   - Add **Next Steps/Tasks** with due dates (optional)\n6. Tap **Save**\n\n💡 Make sure you've added the doctor first under the Doctors section so they appear in the dropdown.",
            },
        ],
    },

    feat_vehicles: {
        id: 'feat_vehicles',
        botMessage: "The Vehicles module covers the full lifecycle of your vehicles. What do you need help with?",
        options: [
            {
                label: "How do I add a vehicle?",
                answer: "To add a vehicle:\n\n1. Go to **Home → Vehicles**\n2. Tap the **+** button\n3. Fill in the **required fields**:\n   - **Year** (4 digits)\n   - **Make** (e.g., Toyota)\n   - **Model** (e.g., Camry)\n4. Optionally add:\n   - Nickname, VIN (max 17 chars), Colour, Plate\n   - Vehicle Type: Car, Truck, SUV, Van, Motorcycle, RV, Boat, or Other\n   - Buy Condition: **New** (default), Used, or Certified\n   - Attachment photo, CarFax record\n5. Tap **Save**\n\nAfter saving, you'll be walked through a **wizard** to optionally add: Service Records, Purchase/Financing, Insurance, Warranty, and Accidents. You can skip any step.",
            },
            {
                label: "How do I log a service record?",
                answer: "To add a service record for a vehicle:\n\n1. Go to **Home → Vehicles** → tap your vehicle\n2. Navigate to the **Service Records** section\n3. Tap **+**\n4. Fill in:\n   - **Date** (required)\n   - **Type** (required): Oil Change, Tire Rotation, Brake Service, Battery Replacement, Air Filter, Transmission Service, Engine Tune-up, Inspection, or Other\n   - Vendor/Shop, Odometer reading, Cost, Notes, Attachments (all optional)\n5. Tap **Save**",
            },
            {
                label: "How do I record an accident?",
                answer: "To log an accident:\n\n1. Go to **Home → Vehicles** → tap your vehicle\n2. Navigate to the **Accidents** section\n3. Tap **+**\n4. Fill in:\n   - **Date** (required)\n   - **Claim #** (required)\n   - **Insurance Type** (required): Comprehensive, Collision, Liability, Uninsured Motorist, Personal Injury Protection, or Other\n   - **Damage description** (required)\n   - **Repair Dates** — From and To (required)\n   - **Repair Shop** (required)\n   - **Total Repair Cost** (required)\n   - Before/After photos, Police Report (optional)\n5. Tap **Save**",
            },
            {
                label: "How do I sell or transfer a vehicle?",
                answer: "To sell or transfer a vehicle:\n\n1. Go to **Home → Vehicles** → tap your vehicle\n2. Tap **Sell / Transfer**\n3. Fill in:\n   - **Sold To** (buyer's name)\n   - **Sold To NCHRG Username** — search live for a NCHRG user (optional, for in-app transfer)\n   - **Sale Price**, **Date**, **Notes**\n4. If selling to a NCHRG user:\n   - Upload the **ownership document**\n   - Optionally select the buyer's **business**\n   - The vehicle can be **shared/transferred** to the new owner\n5. Tap **Confirm**\n\nThe vehicle will show a **SOLD** banner once marked as sold. The buyer will receive a transfer request they can **Accept or Reject** under Vehicles → Receive Vehicle.",
            },
        ],
    },

    feat_realestate: {
        id: 'feat_realestate',
        botMessage: "The Real Estate module lets you manage all your properties and everything associated with them. What do you need?",
        options: [
            {
                label: "What can I track per property?",
                answer: "Each Real Estate property supports these sub-records:\n\n- **Loan/Mortgage** — Lender, account number, balance, monthly payment, interest rate, dates\n- **Utilities** — Type (Electric/Gas/Water/Internet/Cable TV/Trash/Other), provider, cost, account number\n- **Insurance** — Carrier, policy number, premium, renewal dates, agent details\n- **Warranties** — Item name, provider, start/expiry dates\n- **Personal Property at Address** — Items at this location (electronics, furniture, appliances, jewelry, art, other)\n- **Services / Work History** — Date, provider, cost, description of work done\n\nAll sub-records support: View, Add, Edit, Delete, Share, and Edit History.\n\n**Navigation:** Home → Real Estate",
            },
            {
                label: "How do I add a property?",
                answer: "To add a real estate property:\n\n1. Go to **Home → Real Estate**\n2. Tap **+**\n3. Fill in the **required fields**:\n   - **Nickname** (e.g., \"Main Home\")\n   - **Property Type** (e.g., Single Family, Condo, etc.)\n   - **Address**\n   - **City**, **State**, **Zip**, **Country**\n4. Optionally add: Unit, Purchase Date, Purchase Price, Date Sold, Sell Price, and a photo\n5. Tap **Save**\n\nAfter saving, a **wizard** guides you through adding Loan/Mortgage, Utilities, Insurance, Warranties, Personal Property, and Services. All steps are optional and can be completed later.",
            },
            {
                label: "Can I link personal property items to a real estate address?",
                answer: "Yes! You can associate personal belongings with a specific property in two ways:\n\n**From Real Estate:**\n- Go to a property → **Personal Property at Address** section → Add items directly\n\n**From Personal Property:**\n- When adding or editing a personal property item, toggle **\"Link to Real Estate\"**\n- Select the real estate address to associate it with\n- You can also use the **Move** action on an existing item to associate it with a property\n\nThis helps you keep track of what's at each location — useful for insurance or moving purposes.",
            },
        ],
    },

    feat_banking: {
        id: 'feat_banking',
        botMessage: "This covers Banking & Finance, Loans, Insurance, Warranties, and Utilities. What do you need?",
        options: [
            {
                label: "How do I add a bank account?",
                answer: "To add a bank account:\n\n1. Go to **Home → Banking & Finance**\n2. Tap **+**\n3. Fill in:\n   - **Institution** (required) — e.g., Chase, Wells Fargo\n   - **Account Name** (required)\n   - **Account Type** (required): Checking, Savings, Credit Card, Investment, Loan, Money Market, Certificate of Deposit, or Other\n   - Last 4 Digits, Current Balance, APR %, Due Day, Minimum Due, Memo/Notes (all optional)\n   - Toggle **Autopay** if applicable\n   - Toggle **Add to Wallet** to include in Wallet module\n   - **Planned Payments** — add rows with Due Date, Amount, Description\n   - Upload an attachment (optional)\n4. Tap **Save**\n\n🔐 **Biometric authentication** is required every time you open a Banking & Finance record to view details.",
            },
            {
                label: "How do I track a loan?",
                answer: "To add a loan record:\n\n1. Go to **Home → Loans**\n2. Tap **+**\n3. Fill in (**all fields required**):\n   - Lender/Provider, Location, Phone, Email\n   - Account Number, Balance, Estimated Balance\n   - Monthly Payment, Start Date, End Date, Due Day, Rate %\n   - Best Name/Label (a nickname for the loan)\n   - Upload a document (optional)\n4. Tap **Save**\n\nThe Loans dashboard shows **Total Monthly Payment**, **Total Annual Payment**, and **Total Balance** across all your loans.\n\n**Navigation:** Home → Loans",
            },
            {
                label: "How do I track an insurance policy?",
                answer: "To add an insurance policy:\n\n1. Go to **Home → Insurance**\n2. Tap **+**\n3. Fill in (**all required**):\n   - Item Name, Agent Email, Insurance Carrier, Policy Number\n   - Annual Premium, Start Date, Renewal Date, End Date\n   - Due Day (1–31)\n   - Agent Name, Agent Phone (optional)\n   - **Document upload** (required)\n4. Tap **Save**\n\nThe Insurance screen shows your **Total Annual Premium** across all policies.\n\n**Navigation:** Home → Insurance",
            },
            {
                label: "How do I track a utility bill?",
                answer: "To add a utility:\n\n1. Go to **Home → Utilities**\n2. Tap **+**\n3. Fill in:\n   - **Type** (required): Electric, Gas, Water, or Internet\n   - **Provider** (required)\n   - **Start Date** (required)\n   - Monthly Cost, Account Number, Due Day, Phone, Notes, Website (optional)\n   - Upload a document (optional)\n4. Tap **Save**\n\nThe Utilities screen lets you **filter** by: All, By Property (linked real estate), or By Type. Monthly and annual totals update based on your filter.\n\n**Navigation:** Home → Utilities",
            },
            {
                label: "How do I add a warranty?",
                answer: "To track a warranty:\n\n1. Go to **Home → Warranties**\n2. Tap **+**\n3. Fill in:\n   - **Item Name** (required)\n   - **Warranty Provider** (required)\n   - **Start Date** (required)\n   - **Expiration Date** (required — must be after start date)\n   - Notes, Website (optional)\n   - Upload a document (optional)\n4. Tap **Save**\n\n**Navigation:** Home → Warranties",
            },
        ],
    },

    feat_other: {
        id: 'feat_other',
        botMessage: "Which other module are you curious about?",
        options: [
            { label: 'Social Media', nextNodeId: 'feat_social' },
            { label: 'Bookmarks', nextNodeId: 'feat_bookmarks' },
            { label: 'Subscriptions', nextNodeId: 'feat_subscriptions' },
            { label: 'Pets', nextNodeId: 'feat_pets' },
            { label: 'Document', nextNodeId: 'feat_legal' },
            { label: 'Wallet', nextNodeId: 'feat_wallet' },
            { label: 'Personal Property', nextNodeId: 'feat_personal_property' },
        ],
    },

    feat_social: {
        id: 'feat_social',
        botMessage: "The Social Media module securely stores your social account credentials. What do you need to know?",
        options: [
            {
                label: "What information can I store?",
                answer: "For each social media account you can store:\n\n- **Social Network** (required) — selected from a dropdown with brand icons (Facebook, Instagram, TikTok, Twitter/X, LinkedIn, Threads, Telegram, and more — populated from the API)\n- **Account Name** (required)\n- **URL** (optional)\n- **Username** (optional)\n- **Password** (optional)\n\n🔐 **Biometric authentication** is required to both **view** and **edit** account details.\n\n**Navigation:** Home → Social Media",
            },
            {
                label: "Why does it ask for biometrics to view my accounts?",
                answer: "Social Media records contain sensitive credentials like usernames and passwords, so NCHRG protects them with **biometric authentication** (Face ID, Touch ID, or fingerprint).\n\nThis is required every time you:\n- **View** account details\n- **Edit** account details\n\nIf biometrics aren't enrolled on your device, the app will fall back to your **device passcode**. If neither is set up, you'll see a graceful degradation message.",
            },
        ],
    },

    feat_bookmarks: {
        id: 'feat_bookmarks',
        botMessage: "Bookmarks let you save URLs, documents, and notes securely. What would you like to know?",
        options: [
            {
                label: "What types of bookmarks can I save?",
                answer: "Each bookmark can be one of four types:\n\n- **URL** — saves a web link (tap to open in browser)\n- **Document** — upload and store a file\n- **Notes** — free-text notes\n- **Other** — general-purpose entry\n\nFor any bookmark, you can also store a **Username and Password** via the credentials modal (optional).\n\n🔐 **Biometric authentication** is required to:\n- View bookmark details\n- View edit history\n- Change credentials during editing\n\n**Navigation:** Home → Bookmarks",
            },
            {
                label: "How do I add a bookmark?",
                answer: "To add a bookmark:\n\n1. Go to **Home → Bookmarks**\n2. Tap **+**\n3. Fill in:\n   - **Title** (required)\n   - **Type** (required): URL, Document, Notes, or Other\n   - **URL** if type is URL\n   - **Upload document** if type is Document\n   - **Notes** if type is Notes or Other\n   - Optionally add **credentials** (username/password) via the credentials modal\n4. Tap **Save**",
            },
        ],
    },

    feat_subscriptions: {
        id: 'feat_subscriptions',
        botMessage: "The Subscriptions module helps you track all your recurring services. What do you need?",
        options: [
            {
                label: "What can I track per subscription?",
                answer: "For each subscription you can store:\n\n- **Service Name** (required) — e.g., Netflix, Spotify\n- **Email** (required)\n- **Password** (required)\n- **Cost** (required)\n- **Billing Cycle** (required): Monthly or Annually\n- **Next Billing Date** (required)\n- **Payment Method** (required): Credit Card, Debit Card, PayPal, or Bank Transfer\n- Notes (optional)\n\nSubscriptions are grouped by **Monthly** and **Annual** billing cycles, with a **running total** calculated for each group.\n\n🔐 **Biometric authentication** required to view subscription details.\n\n**Navigation:** Home → Subscriptions",
            },
        ],
    },

    feat_pets: {
        id: 'feat_pets',
        botMessage: "The Pets module tracks your pet's health, vets, and more. What do you want to know?",
        options: [
            {
                label: "What information can I store for my pet?",
                answer: "For each pet you can store:\n\n**Overview:** Name, Species (Dog/Cat/Bird/Rabbit/Fish/Other), Breed, Date of Birth, Adoption Date, Gender (Male/Female), Colour, Allergies, Microchip (toggle + number + company), Insurance details (provider, policy number, dates, contact), and a photo.\n\n**Sub-records:**\n- **Vaccinations** — Name, date given, next due date, image\n- **Medications** — Name, dosage, unit, schedule, start/end dates, notes, image\n- **Vet Appointments** — Date, time, vet/clinic name, vet name, reason, location, notes, image\n- **Illnesses** — Date, illness name, treatment, notes, image\n\n**Navigation:** Home → Pets",
            },
            {
                label: "How do I add a new pet?",
                answer: "To add a pet:\n\n1. Go to **Home → Pets**\n2. Tap **+**\n3. Enter the pet's details: Name, Species, Breed, Date of Birth, Adoption Date, Gender (all required for the overview)\n4. Tap **Save**\n\nAfter saving, a **wizard** walks you through adding:\n- Vaccinations\n- Medications\n- Vet Appointments\n- Illnesses\n\nAll wizard steps are optional. You can add them later from the pet's detail screen. If you have multiple pets, tabs will appear for switching between them.",
            },
        ],
    },

    feat_legal: {
        id: 'feat_legal',
        botMessage: "The Document module stores your important documents. What do you need?",
        options: [
            {
                label: "What kinds of documents can I store?",
                answer: "You can store the following document types in the Document module:\n\n- Contract\n- Agreement\n- Power of Attorney\n- Certificate\n- Will\n- Deed\n\nFor each document you can record:\n- **Document Title** (required)\n- **Type** (required — from the list above)\n- **Effective Date** (required)\n- **Expiry Date** (required)\n- Notes/Comments (optional)\n- **PDF upload** (optional)\n\nYou can also download the uploaded PDF directly from the record view.\n\n**Navigation:** Home → Document",
            },
        ],
    },

    feat_wallet: {
        id: 'feat_wallet',
        botMessage: "The Wallet is your digital document hub. Here's what you need to know:",
        options: [
            {
                label: "What is the Wallet and what does it store?",
                answer: "The **Wallet** aggregates important documents from across NCHRG into one place for quick access.\n\nIt can hold:\n- **Passports** (from Identity Hub)\n- **Driver's Licenses** (from Identity Hub)\n- **Licenses & Certifications** (from Identity Hub)\n- **Properties** (from Real Estate)\n- **Bank Accounts** (from Banking & Finance)\n\nDocuments appear in the Wallet when you toggle **\"Add to Wallet\"** on the relevant record in other modules.\n\nYou can also add documents directly from the Wallet screen — supported types: **Driving License, Passport, ID Card, Insurance Card**.\n\n**Navigation:** Home → Wallet",
            },
        ],
    },

    feat_personal_property: {
        id: 'feat_personal_property',
        botMessage: "Personal Property helps you track your belongings. What do you need to know?",
        options: [
            {
                label: "What can I track for personal property?",
                answer: "For each personal property item:\n\n**Main fields:**\n- **Item Name** (required)\n- **Category** (required): Electronics, Furniture, Appliances, Jewelry, Art, or Other\n- Image, Description, Purchase Date, Purchase Price, Date Sold/Discarded (optional)\n- **Link to Real Estate** toggle — associate with a property address\n- **Add to Wallet** toggle\n\n**Optional inline sub-sections:**\n- **Warranty** — Provider, start/expiry dates, notes, website, document\n- **Insurance** — Carrier, policy number, premium, dates, agent details, document\n- **Loan** — Lender, account number, balance, monthly payment, dates, rate, document\n\n**Navigation:** Home → Personal Property",
            },
        ],
    },

    feat_favourites: {
        id: 'feat_favourites',
        botMessage: "Favourites let you pin your most-used modules to the Home screen for quick access. Here's how it works:",
        options: [
            {
                label: "How do I add or change my favourite modules?",
                answer: "To manage your favourite modules:\n\n1. Go to the **Home** tab\n2. Tap **Manage** (next to the Favourites header)\n3. On the Favourites screen:\n   - **Add a favourite** — drag a module from the available list and drop it onto the favourites area\n   - **Remove a favourite** — tap the **X** on any pinned module\n   - **Reorder** — drag and drop to rearrange\n4. Changes are **saved automatically** to the server and cached locally\n\n📌 You can pin a **maximum of 4 modules** as favourites.",
            },
        ],
    },

    feat_search: {
        id: 'feat_search',
        botMessage: "Here's how search works in NCHRG:",
        options: [
            {
                label: "What can I search for?",
                answer: "The **Global Search** on the Home screen lets you search across all your data in real-time.\n\n**Searchable modules:**\nSocial Media, Bookmarks, Subscriptions, Wallet, Document, Identity Hub, Health Tracker, Pets, Personal Property, Real Estate, Vehicles, Banking & Finance, Loans, Utilities, Insurance, Warranties\n\n**How it works:**\n- Results appear after a **400ms delay** (debounced)\n- Grouped by category with colour coding:\n  - 🟢 **Essentials**\n  - 🔵 **Assets**\n  - 🟠 **Liabilities & Expenses**\n- Each result shows: icon, title, subtitle, module name\n- Tapping a result navigates directly to that record\n- In **Business Mode**, search is automatically scoped to your selected business",
            },
        ],
    },

    feat_ai: {
        id: 'feat_ai',
        botMessage: "NCHRG has two AI interfaces. Which are you asking about?",
        options: [
            {
                label: "The main AI Assistant (this one)",
                answer: "The **Primary AI Assistant** (that's me!) is accessible from the **AI Assistant tab** in the bottom navigation.\n\n**What I can do:**\n- Answer questions about any NCHRG feature in natural language\n- Guide you step-by-step through workflows\n- Create, update, and list records via structured tool calls\n- Show **review cards** so you can confirm actions before they're applied\n- Support **voice input** — tap the mic button to speak, tap stop or pause naturally\n- Remember your conversation across the session\n\n**Supported actions:** tool_confirmed (you confirm a proposed action) and tool_cancelled (you cancel a proposed action).\n\nThe AI Assistant tab does NOT show the floating NCHRG button (that's on all other tabs).",
            },
            {
                label: "The floating chatbot button",
                answer: "The **floating NCHRG icon button** appears on all tabs **except** the AI Assistant tab. Tapping it opens the **Simple Chatbot** — a quick Q&A interface.\n\n**Simple Chatbot features:**\n- Text-only conversations (no structured actions)\n- Markdown-rendered responses\n- Typing indicator animation\n- Default suggestion chips: \"View my assets\", \"Check liabilities\", \"Upcoming payments\"\n\nFor more powerful actions (creating records, voice input, etc.), use the **AI Assistant tab** instead.",
            },
            {
                label: "How does voice input work?",
                answer: "To use voice input in the **AI Assistant**:\n\n1. Tap the **microphone button** in the chat input area\n2. Speak your message — the recognised text appears in the input field in real-time\n3. Tap the **stop button** or pause naturally to finish recording\n4. Review the text and send\n\n**Platform notes:**\n- **iOS**: Uses SpeechRecognized event for completion detection\n- **Android**: Uses SpeechResults event\n\nIf voice isn't working, make sure NCHRG has **Microphone** and **Speech Recognition** permissions in your device's Settings.",
            },
        ],
    },

    feat_business_modules: {
        id: 'feat_business_modules',
        botMessage: "Business Mode has exclusive modules. Which one do you want to know about?",
        options: [
            {
                label: "Business Details",
                answer: "**Business Details** stores your business entity information:\n\n- Business Name (required)\n- Description, EIN (optional)\n- State of Formation (dropdown — all 50 US states)\n- Entity Type: LLC, Corporation, Partnership, Sole Proprietorship, or Nonprofit\n- Registered Agent Name, Address, Phone\n- Principal Business Address\n\n**Navigation:** Business Dashboard → Business Details\n\nYou can manage **multiple businesses** and switch between them using the dropdown selector on the Business Dashboard.",
            },
            {
                label: "Business Contacts",
                answer: "**Business Contacts** manages your clients, vendors, partners, and staff:\n\n- **Name** (required)\n- Contact Type: Client, Vendor, Partner, Employee, Manager, Contractor, Consultant, or Other\n- Role/Title, Status (Active/Inactive)\n- Email, Phone, Company/Team, Manager Name, Location\n- Is Primary Contact (Yes/No)\n- **Add to Wallet** toggle\n\nContacts support: View, Add, Edit, Delete, Share, Search, and Edit History.\n\n**Navigation:** Business Dashboard → Business Contacts",
            },
            {
                label: "Projects",
                answer: "**Projects** tracks your business projects:\n\n- **Project Name** (required)\n- Description, Status (Active, On Hold, Completed, Cancelled)\n- Client (dropdown from Business Contacts filtered by client type)\n- Start Date, End Date, Budget, Notes\n- Multi-document attachments\n\n💡 If no clients exist yet, a prompt to \"Add Business Contact\" will appear.\n\n**Navigation:** Business Dashboard → Projects",
            },
            {
                label: "Compliance Vault",
                answer: "**Compliance Vault** is a folder-based document management system:\n\n**Folders:** Create named folders (e.g., \"Tax Filings 2024\")\n\n**Records per folder:**\n- Record Title (required), Record Type, Status, Expiry Date (required), Notes, Document image\n- **Record Types**: Business License, Permit, Tax Filing, Insurance Policy, Environmental Compliance, Safety Inspection, Financial Audit, Employment Record, Data Privacy, Industry Certification, Other\n- **Status colours**: 🟢 Valid, 🔴 Expired/Rejected/Cancelled, 🟠 Pending/Under Review\n\n**Navigation:** Business Dashboard → Compliance Vault → Folder → Records",
            },
            {
                label: "Business Licenses",
                answer: "**Business Licenses** tracks your business credentials:\n\n- **License Name, Number, Issuing Authority** (required)\n- **Fee, Cost, Jurisdiction** (required)\n- Is Active (True/False, required)\n- Renewal Date, Notes (optional)\n- Username & Password (via credentials modal, optional)\n\n🔐 **Biometric authentication** required to view stored credentials (username/password).\n\n**Navigation:** Business Dashboard → Licenses",
            },
        ],
    },

    // CONNECTIONS & SHARING
    connections: {
        id: 'connections',
        botMessage: "Connections let you link with other NCHRG users and share your data. What do you need help with?",
        options: [
            { label: "How do I add a connection?", nextNodeId: 'conn_add' },
            { label: "How do I share data with a connection?", nextNodeId: 'conn_share' },
            { label: "How do connection permissions work?", nextNodeId: 'conn_permissions' },
            { label: "What is Emergency Access?", nextNodeId: 'conn_emergency' },
            { label: "How do I manage connection requests?", nextNodeId: 'conn_requests' },
        ],
    },

    conn_add: {
        id: 'conn_add',
        botMessage: "Here's how to add a connection:",
        options: [
            {
                label: "Walk me through adding a connection",
                answer: "To add a new connection:\n\n1. Go to the **Connections** tab\n2. Tap **+**\n3. **Search** for the person by their NCHRG username (search is debounced and paginated)\n4. Select the **Connection Type**:\n   - **Personal** — share personal data\n   - **Business** — share business data\n   - **Both** — share both personal and business data\n5. If Business or Both: **select which businesses** to share\n6. Toggle **Emergency Contact** if you want this person to be an emergency contact\n7. Tap **Send Request**\n\nThe other person will receive your request under their **Connections → Requests → Received** tab. They must **accept** before sharing is available.",
            },
        ],
    },

    conn_share: {
        id: 'conn_share',
        botMessage: "You can share data at the module level or individual record level. What would you like to know?",
        options: [
            {
                label: "How do I share an entire module?",
                answer: "To share all records in a module with a connection:\n\n1. Navigate to the module (e.g., **Home → Insurance**)\n2. Tap the **Share** button on the module list screen\n3. Select the **connection** you want to share with\n4. Choose the **permission level**: View (read-only) or Edit (can make changes)\n5. Confirm\n\nThe recipient will see your shared records in **Connections → [Your Name] → Shared With You**.",
            },
            {
                label: "How do I share a single record?",
                answer: "To share one specific record:\n\n1. Open the record you want to share (e.g., a specific vehicle)\n2. Tap the **Share** button on that record\n3. Select the **connection** to share with\n4. Choose permission: **View** or **Edit**\n5. Confirm\n\nSharing a single item is independent of sharing the whole module — you can share individual records without giving access to the rest.",
            },
            {
                label: "How do I see what I've shared and edit permissions?",
                answer: "To manage what you're sharing:\n\n1. Go to the **Connections** tab\n2. Tap the connection\n3. Go to the **Yours** tab — this shows everything you're currently sharing with them\n4. Toggle **view/edit permissions** per module or record directly from this screen\n\nTo see what they're sharing with you:\n- Go to the **Shared With You** tab on the same connection detail screen",
            },
        ],
    },

    conn_permissions: {
        id: 'conn_permissions',
        botMessage: "Here's how access control works in NCHRG:",
        options: [
            {
                label: "What's the difference between View and Edit permissions?",
                answer: "NCHRG has two sharing permission levels:\n\n- **View (Read-only)** — The person can see the record but cannot make any changes. Add, Edit, and Delete buttons won't be visible to them.\n- **Edit** — The person can view and edit the record. They can make changes but cannot delete (unless you've granted that level).\n\nThere are also two layers of access control:\n- **Module-level** — Controls whether the Add button and module-wide actions are visible\n- **Entity-level** — Controls whether individual record Edit/Delete buttons are visible\n\nOwn data always has full access (view, edit, delete).",
            },
            {
                label: "Can someone with edit access delete my records?",
                answer: "Sharing with **Edit permission** gives the person view and edit access to that record or module. Delete access is controlled separately at the entity level.\n\nFor records shared from **Emergency Access**, the access is always **read-only** — no editing or deleting regardless of the emergency contact's normal permissions.",
            },
        ],
    },

    conn_emergency: {
        id: 'conn_emergency',
        botMessage: "Emergency Access is a special feature for trusted contacts. Here's how it works:",
        options: [
            {
                label: "What is Emergency Access and how do I set it up?",
                answer: "**Emergency Access** allows a trusted connection to view all your data in a crisis situation.\n\n**Setting up:**\n1. When sending a connection request, toggle **Emergency Contact** on\n2. Alternatively, an existing connection can **request** emergency access from their side\n\n**Approving/rejecting a request:**\n1. Go to **Connections → Requests → Emergency** tab\n2. Tap **Approve** or **Reject**\n\n**Approved access:**\n- The person gains **read-only access to ALL your data** across all modules\n- They cannot edit or delete anything\n- This is useful for family members, caregivers, or lawyers\n\n**States shown to the requestor:**\n- Not Requested → \"Request Access\" button\n- Pending → Waiting for your approval\n- Granted → Full read-only view of your data",
            },
        ],
    },

    conn_requests: {
        id: 'conn_requests',
        botMessage: "Here's how to manage your connection requests:",
        options: [
            {
                label: "How do I accept or decline a request?",
                answer: "To manage incoming connection requests:\n\n1. Go to the **Connections** tab\n2. Tap **Requests**\n3. You'll see three tabs with counts:\n   - **Received** — Incoming requests → tap **Accept** or **Decline**\n   - **Sent** — Requests you've sent out\n   - **Emergency** — Emergency access requests → tap **Approve** or **Reject**\n\nOnce accepted, the connection is active and sharing can begin.",
            },
        ],
    },

    // REMINDERS
    reminders: {
        id: 'reminders',
        botMessage: "NCHRG has automatic and custom reminders. What do you need to know?",
        options: [
            {
                label: "How do automatic reminders work?",
                answer: "NCHRG automatically creates reminders when you add expiring documents. These are triggered by:\n\n- **Passport** expiration date\n- **Driver's License** expiration date\n- **Licenses & Certifications** expiration date\n- **Insurance** renewal dates\n\nWhen you add these records, you set a **\"Remind Before\"** number (default: **90 days**). NCHRG will automatically show the reminder in your **Reminders** tab when the time comes.\n\nNo manual setup needed — just make sure the expiry date is entered correctly.",
            },
            {
                label: "How do I create a custom reminder?",
                answer: "To create an ad-hoc reminder:\n\n1. Go to the **Reminders** tab\n2. Tap the **+** (FAB) button\n3. Fill in:\n   - **Description** (required) — what the reminder is for\n   - **Due Date** (required)\n   - **Frequency** (optional): Daily, Weekly, Monthly, or Yearly\n   - **Notes** (optional)\n4. Tap **Save**\n\nThe reminder will appear in the appropriate tab based on its date.",
            },
            {
                label: "How are reminders organised?",
                answer: "The Reminders screen has four tabs:\n\n- **Due Today** — Reminders with today's date\n- **Upcoming** — Future reminders\n- **Past Due** — Overdue reminders\n- **Completed** — Reminders you've marked as done\n\nYou can tap any reminder to **mark it as Completed**.\n\nIn **Business Mode**, reminders are filtered to show only those related to your currently selected business.",
            },
        ],
    },

    // TROUBLESHOOTING
    troubleshooting: {
        id: 'troubleshooting',
        botMessage: "Let's fix that! What issue are you experiencing?",
        options: [
            { label: "Biometric / Face ID not working", nextNodeId: 'ts_biometric' },
            { label: "Data not syncing / Offline issues", nextNodeId: 'ts_sync' },
            { label: "Missing module or screen", nextNodeId: 'ts_module' },
            { label: "Notifications not working", nextNodeId: 'ts_notifications' },
            { label: "Voice input not working", nextNodeId: 'ts_voice' },
            { label: "Language change not applying", nextNodeId: 'ts_language' },
            { label: "Can't share data or edit shared records", nextNodeId: 'ts_sharing' },
        ],
    },

    ts_biometric: {
        id: 'ts_biometric',
        botMessage: "What's happening with biometric authentication?",
        options: [
            {
                label: "Face ID / Touch ID isn't working",
                answer: "If biometric authentication is failing:\n\n1. Make sure **Face ID or Touch ID** is enrolled on your device (check your phone's Settings → Face ID & Passcode or Touch ID & Passcode)\n2. Make sure NCHRG has **biometric permission** — go to your device Settings → NCHRG → enable Face ID/Touch ID\n3. Try using your **device passcode** as a fallback (NCHRG falls back to passcode automatically if biometrics fail)\n4. If your biometric data has changed (e.g., new Face ID scan), re-enrol in device Settings\n\n**Modules that require biometrics:**\nBanking & Finance, Subscriptions, Social Media (view & edit), Bookmarks (view, edit history, credentials), Business Licenses (credentials)",
            },
            {
                label: "The app says biometrics aren't available",
                answer: "If the app shows a message that biometrics aren't available:\n\n1. Your device may not have Face ID, Touch ID, or fingerprint hardware enrolled\n2. The app will **automatically fall back to your device passcode** if biometrics aren't available\n3. If **neither biometrics nor a passcode** are set up on your device, you'll see a graceful degradation message\n\nWe recommend setting up at least a device passcode to access protected modules like Banking, Subscriptions, and Social Media.",
            },
        ],
    },

    ts_sync: {
        id: 'ts_sync',
        botMessage: "What's the sync issue you're experiencing?",
        options: [
            {
                label: "My data isn't syncing",
                answer: "If records aren't syncing to the server:\n\n1. **Check your internet connection** — NCHRG syncs automatically when connected\n2. Go to **Account → Sync Status** to see the current state:\n   - **Pending** — queued for sync when connection is available\n   - **Synced** — successfully uploaded\n   - **Failed** — couldn't sync, action required\n3. For failed items, tap **Retry** to try again\n4. If an item keeps failing, tap **Discard & Redo** — this re-opens the form so you can re-enter and re-save\n5. You can also tap **Retry All** to attempt all pending items at once",
            },
            {
                label: "I see an 'Offline' banner",
                answer: "The **Offline banner** appears at the top of the screen when your device has no internet connection.\n\n**What you can still do offline:**\n- Create and edit records (they save locally)\n- View previously loaded data\n\n**What happens to offline changes:**\n- They're queued in local storage (AsyncStorage)\n- A toast confirms: *\"Saved offline — will sync when connected\"*\n- Once you're back online, the app **automatically syncs** everything\n\nYou can monitor and manage the sync queue via **Account → Sync Status**.",
            },
        ],
    },

    ts_module: {
        id: 'ts_module',
        botMessage: "Which module or screen can't you find?",
        options: [
            {
                label: "I can't see a Business module",
                answer: "Business-specific modules (Business Details, Business Contacts, Projects, Compliance Vault, Business Licenses) are **only visible in Business Mode**.\n\nTo switch to Business Mode:\n1. Use the **role toggle** in the app to switch from Personal to Business\n2. On the Business Dashboard, make sure you have a **business selected** from the dropdown — some modules are scoped to a selected business\n3. If you haven't created a business yet, go to **Business Dashboard → Business Details → +** to create one\n\nShared modules (Vehicles, Insurance, etc.) are also available in Business Mode but scoped to your selected business.",
            },
            {
                label: "A screen won't load or is blank",
                answer: "If a screen isn't loading:\n\n1. **Pull down to refresh** the screen\n2. Check your internet connection — you may have gone offline briefly\n3. **Force-close** the app and reopen it:\n   - iOS: Swipe up from the bottom, swipe the app away\n   - Android: Use the Recent Apps button, swipe the app away\n4. If the issue persists, try **clearing the app cache** (Android: Settings → Apps → NCHRG → Clear Cache)\n5. Check if there's an app update available in the App Store or Play Store\n\nIf the screen consistently fails to load, please report it via the app's support channel.",
            },
        ],
    },

    ts_notifications: {
        id: 'ts_notifications',
        botMessage: "Which notifications are missing or not working?",
        options: [
            {
                label: "All notifications are off",
                answer: "To re-enable all notifications:\n\n1. **Check your phone settings first:**\n   - iOS: Settings → Notifications → NCHRG → Allow Notifications (toggle on)\n   - Android: Settings → Apps → NCHRG → Notifications → Enable\n2. Then inside the app, go to **Account → Notifications** (if available) to fine-tune per category\n3. Make sure **Do Not Disturb** mode isn't active on your device",
            },
            {
                label: "Notifications are delayed",
                answer: "Delayed notifications are usually caused by **battery saver or power management** restrictions:\n\n**Android:**\n1. Go to device Settings → Battery → Battery Optimisation\n2. Find NCHRG and set it to **Not Optimised** or **Unrestricted**\n3. Also check: Settings → Apps → NCHRG → Battery → Allow Background Activity\n\n**iOS:**\n1. Disable **Low Power Mode** (Settings → Battery → Low Power Mode) when you need real-time alerts\n2. Make sure NCHRG is allowed **Background App Refresh** (Settings → General → Background App Refresh → NCHRG)",
            },
        ],
    },

    ts_voice: {
        id: 'ts_voice',
        botMessage: "Here's how to fix voice input issues:",
        options: [
            {
                label: "The microphone button isn't working",
                answer: "If voice input isn't working in the AI Assistant:\n\n1. Make sure NCHRG has **Microphone permission**:\n   - iOS: Settings → Privacy & Security → Microphone → NCHRG (toggle on)\n   - Android: Settings → Apps → NCHRG → Permissions → Microphone (Allow)\n2. Make sure NCHRG has **Speech Recognition permission** (iOS): Settings → Privacy & Security → Speech Recognition → NCHRG\n3. **Close and reopen** the app after granting permissions\n4. Try speaking in a quieter environment — background noise can interrupt recognition\n\nVoice input is only available in the **AI Assistant tab**, not in the simple chatbot.",
            },
        ],
    },

    ts_language: {
        id: 'ts_language',
        botMessage: "Here's what to do if your language change isn't taking effect:",
        options: [
            {
                label: "I changed the language but the app still looks the same",
                answer: "Some language changes — especially **RTL languages** (Arabic, Hebrew, Urdu) — require a **full app restart** to take effect.\n\nTo apply:\n1. After changing the language in **Account → Languages**, force-close the app\n2. Reopen NCHRG\n3. The language and layout (including RTL direction) should now be applied\n\n**RTL languages flip the entire UI** — navigation, text alignment, and icons will all mirror. This is expected behaviour.",
            },
        ],
    },

    ts_sharing: {
        id: 'ts_sharing',
        botMessage: "What's the sharing issue you're facing?",
        options: [
            {
                label: "I can't share data — no connections show up",
                answer: "You can only share data with **existing connections**. If no connections appear when you try to share:\n\n1. Go to the **Connections** tab\n2. Tap **+** to send a connection request to the person\n3. They must **accept** the request before you can share with them\n\nOnce connected, go back to the module and the Share button will let you select them.",
            },
            {
                label: "I can't edit a record that was shared with me",
                answer: "If you can't edit a shared record, you likely have **View (read-only) permission** on it.\n\nTo get edit access:\n1. Ask the data owner to go to their **Connections** tab\n2. Tap your name → go to the **Yours** tab\n3. Find the shared module or record and toggle **Edit permission** on for you\n\nOnce updated, you'll be able to edit that record.",
            },
        ],
    },

    // PERSONAL vs BUSINESS MODE
    modes: {
        id: 'modes',
        botMessage: "NCHRG has two modes. What would you like to know?",
        options: [
            {
                label: "What's the difference between Personal and Business mode?",
                answer: "**Personal Mode** (default):\n- Manages your individual life records\n- Home screen shows three categories: **Essentials** (Identity, Health, Social, etc.), **Assets** (Vehicles, Real Estate, Property, etc.), **Liabilities** (Loans, Utilities, Insurance, etc.)\n- Full set of personal modules\n\n**Business Mode:**\n- Manages records for one or more businesses\n- Home becomes the **Business Dashboard** with Fleet, Assets, and Expenses tabs\n- Exclusive modules: Business Details, Business Contacts, Projects, Compliance Vault, Business Licenses\n- Shared modules (Vehicles, Insurance, etc.) are **scoped to the selected business**\n- You can manage **multiple businesses** and switch between them with a dropdown\n- All API calls include the selected `businessId`\n\nYou can switch between modes using the **role toggle** in the app. Your personal and business data are kept completely separate.",
            },
            {
                label: "How do I create a business?",
                answer: "To create a business in Business Mode:\n\n1. Switch to **Business Mode** using the role toggle\n2. Go to the **Business Dashboard**\n3. Tap **Business Details → +**\n4. Fill in:\n   - **Business Name** (required)\n   - Description, EIN, State of Formation (dropdown), Entity Type (LLC, Corporation, Partnership, Sole Proprietorship, Nonprofit)\n   - Registered Agent details (Name, Address, Phone)\n   - Principal Business Address\n5. Tap **Save**\n\nOnce created, select it from the **business dropdown** on the Business Dashboard to scope all modules to that business.",
            },
            {
                label: "Can I switch between businesses?",
                answer: "Yes! If you have multiple businesses:\n\n1. Go to the **Business Dashboard** (Business Mode home screen)\n2. Use the **dropdown selector** at the top to switch between businesses\n3. All modules — Vehicles, Insurance, Contacts, etc. — will automatically reflect the selected business\n4. Reminders in Business Mode are also filtered by your selected business\n\nYou can add as many businesses as needed via **Business Details → +**.",
            },
        ],
    },

    // PRIVACY, SECURITY & SUBSCRIPTION
    privacy: {
        id: 'privacy',
        botMessage: "What would you like to know about privacy, security, or your subscription?",
        options: [
            { label: "How is my data protected?", nextNodeId: 'priv_security' },
            { label: "GDPR — Access, Delete, or Appeal", nextNodeId: 'priv_gdpr' },
            { label: "Subscription plans", nextNodeId: 'priv_subscription' },
            { label: "Health & analytics data consent", nextNodeId: 'priv_consent' },
            { label: "Terms & Privacy Policy", nextNodeId: 'priv_legal' },
        ],
    },

    priv_security: {
        id: 'priv_security',
        botMessage: "Here's how NCHRG protects your data:",
        options: [
            {
                label: "How is my stored data secured?",
                answer: "NCHRG takes a multi-layer approach to security:\n\n- **Biometric authentication** for sensitive modules (Banking, Subscriptions, Social Media, Bookmarks, Business Licenses)\n- **Secure token storage** — your access token and refresh token are stored securely on-device\n- **Automatic token re-validation** when the app returns to foreground or network reconnects\n- **Offline queue protection** — offline records are stored in secure local storage (AsyncStorage)\n- **Edit History** on all records — full audit trail of every change\n\nFor data at rest and in transit, see the full Privacy Policy via **Account → Privacy Policy**.",
            },
            {
                label: "What happens if biometrics fail?",
                answer: "If biometric authentication (Face ID/Touch ID/fingerprint) fails or isn't enrolled:\n\n1. NCHRG **automatically falls back** to your **device passcode**\n2. If no passcode is set either, you'll see a **graceful degradation message** explaining that you need to set up device security to access protected features\n\n**Tip:** We recommend always having at least a device passcode enabled to access sensitive modules like Banking & Finance, Subscriptions, and Social Media.",
            },
        ],
    },

    priv_gdpr: {
        id: 'priv_gdpr',
        botMessage: "NCHRG supports your GDPR rights. What do you need to do?",
        options: [
            {
                label: "Request a copy of my data",
                answer: "To request access to your personal data:\n\n1. Go to **Account → Request Access to Data**\n2. Fill in:\n   - **Request Type**: Access Copy, Confirm Collection, or Both\n   - **Data Category**: All, Health, Financial, or Other\n   - **Preferred Format**: In-App, Email, or Other\n   - **Additional Details** (optional)\n3. Submit\n\nNCHRG will process your request and provide your data in the format you selected.",
            },
            {
                label: "Request deletion of my data",
                answer: "To request data deletion:\n\n1. Go to **Account → Request Deletion of Data**\n2. Fill in:\n   - **Scope**: Delete All or Delete Specific\n   - If Delete Specific: describe which data you want deleted\n   - Check the **Confirmation checkbox**\n3. Submit\n\n⚠️ Deletion requests are permanent and cannot be reversed.",
            },
            {
                label: "Appeal a privacy decision",
                answer: "If you want to appeal a decision NCHRG made about a privacy request:\n\n1. Go to **Account → Appeal Decision**\n2. Fill in:\n   - **Decision Type**: Access, Deletion, or Other\n   - **Reference Number** (from your original request)\n   - **Decision Date**\n   - **Reason** for your appeal\n   - Upload **Supporting Document** (optional)\n3. Submit\n\nNCHRG will review your appeal and respond accordingly.",
            },
        ],
    },

    priv_subscription: {
        id: 'priv_subscription',
        botMessage: "Here's what you need to know about NCHRG's subscription plans:",
        options: [
            {
                label: "What's included in Free vs Premium?",
                answer: "**Free Plan:**\n- Access to basic features across **3 feature tiers**\n\n**Premium Plan:**\n- Extended features across **5 feature tiers**\n- Unlocks additional capabilities beyond the Free tier\n- Exact pricing is displayed dynamically in the app (fetched from the server)\n\n*Note: Payment processing details may vary — check the app for the most current information.*",
            },
            {
                label: "How do I upgrade to Premium?",
                answer: "To upgrade your subscription:\n\n1. Go to the **Account** tab\n2. Tap **Subscription Plan**\n3. Tap **Choose Plan**\n4. Select **Premium**\n5. Follow the on-screen steps to complete the upgrade\n\nYou can also choose your plan during the initial signup onboarding on the **Choose Plan** screen.",
            },
        ],
    },

    priv_consent: {
        id: 'priv_consent',
        botMessage: "Here's how health and analytics data consent works in NCHRG:",
        options: [
            {
                label: "What are the three consent toggles?",
                answer: "During onboarding (and modifiable later), NCHRG asks for consent for three things:\n\n1. **Health Data Collection** — What health data NCHRG collects, why, and how to withdraw consent\n2. **Health Data Sharing** — What health data is shared, with whom, and why\n3. **Analytics & Crash Reporting** — What diagnostic and usage data is shared\n\nEach toggle requires you to **explicitly check a checkbox** in a detailed consent modal before it can be enabled. Disabling any toggle also shows a confirmation modal.",
            },
            {
                label: "How do I change my consent settings?",
                answer: "If you want to change your privacy consent settings after onboarding:\n\nThese settings were configured during registration but you can review your options via:\n1. **Account → Privacy Policy** to understand what's collected\n2. **Account → Request Deletion of Data** if you want specific health data removed\n3. **Account → Request Access to Data** for a copy of what's stored\n\nFor consent toggle management post-onboarding, check **Account** settings or contact NCHRG support if you don't see the option.",
            },
        ],
    },

    priv_legal: {
        id: 'priv_legal',
        botMessage: "You can read NCHRG's legal documents any time:",
        options: [
            {
                label: "Where do I find the Terms & Conditions?",
                answer: "To read the Terms & Conditions:\n\n1. Go to the **Account** tab\n2. Tap **Terms & Conditions**\n\nThis is a read-only view of the full terms.",
            },
            {
                label: "Where do I find the Privacy Policy?",
                answer: "To read the Privacy Policy:\n\n1. Go to the **Account** tab\n2. Tap **Privacy Policy**\n\nThe Privacy Policy has **4 sections** covering how your data is collected, used, stored, and your rights. It is read-only.",
            },
        ],
    },
};

const ROOT_NODE = CONVERSATION_TREE['root'];


const OfflineMessageBubble: FC<{ message: IChatMessage; themeColor: string }> = memo(
    ({ message, themeColor }) => {
        const { themeColors } = useUserRole();
        const bubbleStyles = useMemo(() => makeBubbleStyles(themeColors as RoleTheme), [themeColors]);
        const fadeAnim = useRef(new Animated.Value(0)).current;
        const slideAnim = useRef(new Animated.Value(message.isUser ? 18 : -18)).current;

        useEffect(() => {
            Animated.parallel([
                Animated.timing(fadeAnim, { toValue: 1, duration: 260, useNativeDriver: true }),
                Animated.spring(slideAnim, { toValue: 0, tension: 80, friction: 10, useNativeDriver: true }),
            ]).start();
        }, []);

        const formatTime = (d: Date) =>
            d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        const renderText = (raw: string) => {
            const lines = raw.split('\n');
            return (
                <Text style={[bubbleStyles.text, message.isUser ? bubbleStyles.userText : bubbleStyles.botText]}>
                    {lines.map((line, li) => {
                        const parts = line.split(/(\*\*.*?\*\*)/g);
                        return (
                            <Text key={li}>
                                {li > 0 && '\n'}
                                {parts.map((part, pi) =>
                                    part.startsWith('**') && part.endsWith('**') ? (
                                        <Text key={pi} style={{ fontWeight: '700' }}>{part.slice(2, -2)}</Text>
                                    ) : (
                                        <Text key={pi}>{part}</Text>
                                    )
                                )}
                            </Text>
                        );
                    })}
                </Text>
            );
        };

        return (
            <Animated.View
                style={[
                    bubbleStyles.row,
                    message.isUser ? bubbleStyles.userRow : bubbleStyles.botRow,
                    { opacity: fadeAnim, transform: [{ translateX: slideAnim }] },
                ]}
            >
                {!message.isUser && (
                    <View style={[bubbleStyles.avatar, { backgroundColor: themeColor }]}>
                        <Image source={ICONS.APP_ICON} style={{ width: 16, height: 16, tintColor: themeColors.background }} resizeMode="contain" />
                    </View>
                )}
                <View style={bubbleStyles.wrapper}>
                    <View style={[
                        bubbleStyles.bubble,
                        message.isUser
                            ? [bubbleStyles.userBubble, { backgroundColor: themeColor }]
                            : bubbleStyles.botBubble,
                    ]}>
                        {renderText(message.text)}
                    </View>
                    <Text style={[bubbleStyles.time, message.isUser ? bubbleStyles.timeRight : bubbleStyles.timeLeft]}>
                        {formatTime(message.timestamp)}
                    </Text>
                </View>
            </Animated.View>
        );
    }
);



const TypingDots: FC<{ themeColor: string }> = memo(({ themeColor }) => {
    const { themeColors } = useUserRole();
    const dotsStyles = useMemo(() => makeDotsStyles(themeColors as RoleTheme), [themeColors]);
    const d1 = useRef(new Animated.Value(0)).current;
    const d2 = useRef(new Animated.Value(0)).current;
    const d3 = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const anim = (d: Animated.Value, delay: number) =>
            Animated.loop(Animated.sequence([
                Animated.delay(delay),
                Animated.timing(d, { toValue: -5, duration: 280, useNativeDriver: true }),
                Animated.timing(d, { toValue: 0, duration: 280, useNativeDriver: true }),
                Animated.delay(500),
            ]));
        const a1 = anim(d1, 0); a1.start();
        const a2 = anim(d2, 140); a2.start();
        const a3 = anim(d3, 280); a3.start();
        return () => { a1.stop(); a2.stop(); a3.stop(); };
    }, []);

    return (
        <View style={dotsStyles.row}>
            <View style={[dotsStyles.avatar, { backgroundColor: themeColor }]}>
                <Text style={dotsStyles.avatarText}>✦</Text>
            </View>
            <View style={dotsStyles.bubble}>
                {[d1, d2, d3].map((d, i) => (
                    <Animated.View key={i} style={[dotsStyles.dot, { transform: [{ translateY: d }] }]} />
                ))}
            </View>
        </View>
    );
});



interface IOptionButtonsProps {
    options: IConvoOption[];
    onPress: (option: IConvoOption) => void;
    themeColor: string;
    showBack: boolean;
    onBack: () => void;
}

const OptionButtons: FC<IOptionButtonsProps> = memo(({ options, onPress, themeColor, showBack, onBack }) => {
    const { themeColors } = useUserRole();
    const optStyles = useMemo(() => makeOptStyles(themeColors as RoleTheme), [themeColors]);
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(10)).current;

    useEffect(() => {
        fadeAnim.setValue(0);
        slideAnim.setValue(10);
        Animated.parallel([
            Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
            Animated.spring(slideAnim, { toValue: 0, tension: 70, friction: 10, useNativeDriver: true }),
        ]).start();
    }, [options]);

    return (
        <Animated.View style={[optStyles.container, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
            {/* Divider */}
            <View style={optStyles.dividerRow}>
                <View style={optStyles.dividerLine} />
                <Text style={optStyles.dividerText}>choose an option</Text>
                <View style={optStyles.dividerLine} />
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={optStyles.scroll}
                keyboardShouldPersistTaps="handled"
            >
                {options.map((opt, i) => (
                    <TouchableOpacity
                        key={i}
                        style={[optStyles.btn, { borderColor: themeColor + '28' }]}
                        onPress={() => onPress(opt)}
                        activeOpacity={0.7}
                    >
                        <Text style={optStyles.btnText}>{opt.label}</Text>
                        <View style={[optStyles.arrowCircle, { backgroundColor: themeColor + '15' }]}>
                            <Text style={[optStyles.arrowText, { color: themeColor }]}>›</Text>
                        </View>
                    </TouchableOpacity>
                ))}

                {showBack && (
                    <TouchableOpacity style={optStyles.backBtn} onPress={onBack} activeOpacity={0.7}>
                        <Text style={optStyles.backText}>← Ask about something else</Text>
                    </TouchableOpacity>
                )}
            </ScrollView>
        </Animated.View>
    );
});



const OfflineChatScreen: FC = () => {
    const { themeColors } = useUserRole();
    const themeColor = themeColors.primary;
    const screenStyles = useMemo(() => makeScreenStyles(themeColors as RoleTheme), [themeColors]);

    const [messages, setMessages] = useState<IChatMessage[]>([]);
    const [currentNode, setCurrentNode] = useState<IConvoNode>(ROOT_NODE);
    const [isTyping, setIsTyping] = useState(false);
    const [atLeaf, setAtLeaf] = useState(false); // true after a final answer is shown

    const flatListRef = useRef<FlatList>(null);

    const scrollToBottom = useCallback(() => {
        setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 120);
    }, []);

    const postBotMessage = useCallback((text: string, delay = 700) => {
        setIsTyping(true);
        setTimeout(() => {
            setIsTyping(false);
            setMessages((prev) => [
                ...prev,
                { id: `bot-${Date.now()}`, text, isUser: false, timestamp: new Date() },
            ]);
            scrollToBottom();
        }, delay);
    }, [scrollToBottom]);

    // Greet on mount
    useEffect(() => {
        postBotMessage(ROOT_NODE.botMessage, 500);
    }, []);

    const handleOptionPress = useCallback((option: IConvoOption) => {
        // Post user message
        setMessages((prev) => [
            ...prev,
            { id: `user-${Date.now()}`, text: option.label, isUser: true, timestamp: new Date() },
        ]);
        scrollToBottom();

        if (option.answer) {
            // Leaf — show answer, then show "Ask something else"
            postBotMessage(option.answer, 750);
            setAtLeaf(true);
        } else if (option.nextNodeId) {
            const next = CONVERSATION_TREE[option.nextNodeId];
            if (!next) return;
            setAtLeaf(false);
            setCurrentNode(next);
            postBotMessage(next.botMessage, 750);
        }
    }, [postBotMessage, scrollToBottom]);

    const handleBack = useCallback(() => {
        setAtLeaf(false);
        setCurrentNode(ROOT_NODE);
        postBotMessage("Of course! What else can I help you with?", 400);
    }, [postBotMessage]);

    const renderMessage: ListRenderItem<IChatMessage> = useCallback(
        ({ item }) => <OfflineMessageBubble message={item} themeColor={themeColor} />,
        [themeColor]
    );

    const keyExtractor = useCallback((item: IChatMessage) => item.id, []);
    const ListFooter = useCallback(() => (isTyping ? <TypingDots themeColor={themeColor} /> : null), [isTyping, themeColor]);

    return (
        <View style={screenStyles.root}>
            <FlatList
                ref={flatListRef}
                data={messages}
                renderItem={renderMessage}
                keyExtractor={keyExtractor}
                contentContainerStyle={screenStyles.messagesList}
                showsVerticalScrollIndicator={false}
                ListFooterComponent={ListFooter}
                onContentSizeChange={scrollToBottom}
            />

            {/* Hide options while bot is "typing" */}
            {!isTyping && (
                <OptionButtons
                    options={atLeaf ? [] : currentNode.options}
                    onPress={handleOptionPress}
                    themeColor={themeColor}
                    showBack={atLeaf || currentNode.id !== 'root'}
                    onBack={handleBack}
                />
            )}
        </View>
    );
};

export default OfflineChatScreen;
