import { t } from 'i18next';
import * as Yup from 'yup';

type FormKey = string;

// Reusable field validators
const requiredString = (fieldName: string) =>
  Yup.string().required(`${fieldName} is required`);

const optionalString = () => Yup.string().nullable();

const optionalEmail = () => Yup.string().email('Invalid email').nullable();

const optionalNumber = (fieldName: string) =>
  Yup.number()
    .typeError(`${fieldName} must be a number`)
    .min(0, 'Must be >= 0')
    .nullable();

const optionalDate = () => Yup.date().nullable();

const optionalUrl = () =>
  Yup.string()
    .matches(
      /^(https?:\/\/)?(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z]{2,}(\S*)$/,
      'Invalid URL',
    )
    .nullable();

const emailField = () =>
  Yup.string()
    .required('Email is required')
    .email('Please enter a valid email');

const passwordField = () =>
  Yup.string()
    .required('Password is required')
    .min(6, 'Password must be at least 6 characters');

export const validationSchema = (formKey: FormKey, options?: any) => {
  const isEditMode = options?.isEditMode ?? false;

  switch (formKey) {
    // ─── Auth Schemas ──────────────────────────────────
    case 'login':
      return Yup.object().shape({
        userName: requiredString('Username'),
        password: requiredString('Password'),
      });

    case 'signup':
      return Yup.object().shape({
        name: requiredString('Name'),
        username: requiredString('Username'),
        email: emailField(),
        phone: requiredString('Phone number'),
        password: Yup.string()
          .required('Password is required')
          .min(7, 'Password must be at least 7 characters')
          .matches(/[A-Z]/, 'Password must contain at least one capital letter')
          .matches(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
        confirmPassword: Yup.string()
          .required('Please confirm your password')
          .oneOf([Yup.ref('password')], 'Passwords do not match'),
      });

    case 'forgot_password':
      return Yup.object().shape({
        username: requiredString('Username'),
        method: Yup.string()
          .oneOf(['email', 'phone'], 'Please select a valid method')
          .required('Verification method is required'),
      });

    case 'new_password':
      return Yup.object().shape({
        password: passwordField(),
        confirmPassword: Yup.string()
          .required('Please confirm your password')
          .oneOf([Yup.ref('password')], 'Passwords do not match'),
      });

    case 'update_email':
      return Yup.object().shape({
        email: emailField(),
      });

    case 'drivers_license':
      return Yup.object().shape({
        licenseNumber: requiredString('License number'),
        state: requiredString('State'),
        expirationDate: Yup.mixed().required('Expiration date is required'),
        classType: requiredString('License class'),
        remindBefore: optionalString(),
        licenseImageIds: Yup.array().of(Yup.string()).nullable(),
        isAddedInWallet: Yup.boolean().nullable(),
      });

    case 'passport':
      return Yup.object().shape({
        passportNumber: requiredString('Passport number'),
        countryId: requiredString('Country'),
        countryName: optionalString(),
        expirationDate: Yup.mixed().required('Expiration date is required'),
        passportType: requiredString('Passport type'),
        remindBefore: optionalString(),
        passportImageIds: Yup.array().of(Yup.string()).nullable(),
        isAddedInWallet: Yup.boolean().nullable(),
      });

    case 'identity_form':
      return Yup.object().shape({
        username: optionalString(),
        fullName: requiredString('Full name'),
        dateOfBirth: optionalDate(),
        phoneNumber: optionalString(),
        address: optionalString(),
        city: optionalString(),
        stateId: optionalString(),
        zip: optionalString(),
        countryId: optionalString(),
        countryName: optionalString(),
      });

    case 'license_certification':
      return Yup.object().shape({
        type: requiredString('Type'),
        licenseCertNumber: requiredString('License/Cert number'),
        jurisdiction: requiredString('Jurisdiction'),
        issuerAuthority: requiredString('Issuer/Authority'),
        expirationDate: Yup.mixed().required('Expiration date is required'),
        remindBefore: optionalString(),
        imageIds: Yup.array().of(Yup.string()).nullable(),
      });

   
    case 'identity_license_certification':
      return Yup.object().shape({
        licenseCertNumber: requiredString('License/Cert number'),
        issuerAuthority: requiredString('Issuer/Authority'),
        expirationDate: Yup.mixed().test(
          'expiration-required',
          'Expiration date is required',
          value => value !== undefined && value !== null && value !== '',
        ),
        type: requiredString('Type'),
        jurisdiction: optionalString(),
        remindBefore: optionalString(),
        imageIds: Yup.array().of(Yup.string()).nullable(),
      });

    // ─── Module Schemas ───────────────────────────────
    case 'bank_account':
      return Yup.object().shape({
        institution: requiredString('Institution'),
        accountName: requiredString('Account name'),
        type: Yup.mixed().required('Account type is required'),
        lastFourDigits: Yup.string()
          .nullable()
          .test(
            'is-valid-digits',
            'Must be exactly 4 digits',
            function (value) {
              if (!value) return true; // Optional field
              return /^\d{4}$/.test(value);
            },
          ),
        currentBalance: Yup.number()
          .nullable()
          .typeError('Current balance must be a number')
          .min(0, 'Current balance cannot be negative'),
        aprPercentage: Yup.number()
          .nullable()
          .typeError('APR must be a number')
          .min(0, 'APR cannot be negative')
          .max(100, 'APR cannot exceed 100%'),
        dueDay: Yup.number()
          .nullable()
          .typeError('Due day must be a number')
          .integer('Due day must be a whole number')
          .min(1, 'Due day must be between 1 and 31')
          .max(31, 'Due day must be between 1 and 31'),
        minDue: Yup.number()
          .nullable()
          .typeError('Minimum due must be a number')
          .min(0, 'Minimum due cannot be negative'),
        startDate: Yup.mixed().nullable().optional(),
        endDate: Yup.mixed()
          .nullable()
          .optional()
          .test(
            'endDate-after-startDate',
            'End date must be after start date',
            function (value) {
              const { startDate } = this.parent;
              if (!value || !startDate) return true;
              return new Date(value as any) > new Date(startDate as any);
            },
          ),
      });

    case 'bookmark':
      return Yup.object().shape({
        title: requiredString('Title'),
        type: Yup.mixed().required('Type is required'),
        url: Yup.string().when('type', {
          is: 2, // URL type
          then: schema =>
            schema
              .required('URL is required')
              .test('valid-url', 'Please enter a valid URL', value => {
                if (!value) return false;
                try {
                  const urlToTest = /^https?:\/\//i.test(value) ? value : `https://${value}`;
                  new URL(urlToTest);
                  return true;
                } catch {
                  return false;
                }
              }),
          otherwise: schema => schema.optional(),
        }),
        notes: Yup.string().when('type', {
          is: (val: any) => val === 1 || val === 3, // Notes or Other
          then: schema => schema.required('Notes are required'),
          otherwise: schema => schema.optional(),
        }),
        documentIds: Yup.array().when('type', {
          is: 0, // Document type
          then: schema => schema.min(1, 'Please upload at least one document'),
          otherwise: schema => schema.optional(),
        }),
        startDate: Yup.mixed().nullable().optional(),
        endDate: Yup.mixed()
          .nullable()
          .optional()
          .test(
            'endDate-after-startDate',
            'End date must be after start date',
            function (value) {
              const { startDate } = this.parent;
              if (!value || !startDate) return true;
              return new Date(value as any) > new Date(startDate as any);
            },
          ),
      });

    case 'legal_document':
      return Yup.object().shape({
        name: requiredString('Document name'),
        type: requiredString('Document type'),
        effectiveDate: Yup.mixed().required('Effective date is required'),
        // endDate: Yup.mixed().required('End date is required'),
        endDate: Yup.mixed().nullable(''),
      });

    case 'loan':
      return Yup.object().shape({
        lenderProvider: requiredString('Lender/Provider'),
        lenderLocation: Yup.string().optional(),
        lenderPhoneNumber: Yup.string().optional(),
        lenderEmail: Yup.string().optional(),
        accountNumber: Yup.string().optional(),
        balance: Yup.string().required('Balance is required'),
        estBalance: Yup.string().optional(),
        monthlyPayment: Yup.string().required('Monthly payment is required'),
        startDate: Yup.date().required('Start date is required'),

        endDate: Yup.date()
          .nullable()
          .optional()
          .test(
            'endDate-after-startDate',
            'End date must be greater than start date',
            function (value) {
              const { startDate } = this.parent;

              if (!value || !startDate) return true;

              return value > startDate; // both are already Date objects
            },
          ),
        dueDay: Yup.number()
          .required('Due day is required')
          .typeError('Due day must be a number')
          .integer('Due day must be a whole number')
          .min(1, 'Due day must be between 1 and 31')
          .max(31, 'Due day must be between 1 and 31'),
        ratePercent: Yup.number()
          .optional()
          .typeError('Rate must be a number')
          .min(0, 'Rate must be between 0% and 100%')
          .max(100, 'Rate must be between 0% and 100%'),
        bestName: Yup.string().optional(),
        uploadAttachments: Yup.mixed().nullable().optional(),
      });

    case 'social_media':
      return Yup.object().shape({
        socialNetworkTypeId: Yup.mixed().required('Platform is required'),
        accountName: requiredString('Account name'),
        startDate: Yup.mixed().nullable().optional(),
        endDate: Yup.mixed()
          .nullable()
          .optional()
          .test(
            'endDate-after-startDate',
            'End date must be greater than start date',
            function (value) {
              const { startDate } = this.parent;
              if (!value || !startDate) return true;
              const start = new Date(startDate as string);
              const end = new Date(value as string);
              return (
                !isNaN(start.getTime()) && !isNaN(end.getTime()) && end > start
              );
            },
          ),
      });

    case 'caregiver':
      return Yup.object().shape({
        name: requiredString('Name'),
        email: optionalEmail(),
        startDate: Yup.mixed().nullable().optional(),
        endDate: Yup.mixed()
          .nullable()
          .optional()
          .test(
            'end-after-start',
            'End date must be after start date',
            function (value) {
              const { startDate } = this.parent;
              if (!value || !startDate) return true;
              return new Date(value as any) > new Date(startDate as any);
            },
          ),
      });

    case 'doctor':
      return Yup.object().shape({
        name: requiredString('Name'),
        speciality: requiredString('Speciality'),
        npiId: optionalString(),
        officeClinic: requiredString('Office / Clinic'),
        phone: Yup.string()
          .nullable()
          .matches(/^[+\d\s\-().]*$/, {
            message: 'Invalid phone number',
            excludeEmptyString: true,
          }),
        website: Yup.string()
          .nullable()
          .matches(
            /^(https?:\/\/)?(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z]{2,}(\S*)$/,
            {
              message: 'Invalid URL',
              excludeEmptyString: true,
            },
          ),
        email: optionalEmail(),
        address: optionalString(),
        startDate: Yup.mixed().nullable().optional(),
        endDate: Yup.mixed()
          .nullable()
          .optional()
          .test(
            'end-after-start',
            'End date must be after start date',
            function (value) {
              const { startDate } = this.parent;
              if (!value || !startDate) return true;
              return new Date(value as any) > new Date(startDate as any);
            },
          ),
        dependentEndDate: Yup.mixed()
          .nullable()
          .optional()
          .test(
            'dep-end-after-start',
            'Dependent end date must be after start date',
            function (value) {
              const { startDate } = this.parent;
              if (!value || !startDate) return true;
              return new Date(value as any) > new Date(startDate as any);
            },
          ),
      });

    case 'pet':
      return Yup.object().shape({
        name: requiredString('Pet name'),
        type: requiredString('Pet type'),
        breed: requiredString('Breed'),
        birthday: Yup.mixed().nullable(),
        dateOfAdoption: Yup.mixed().required('Date of adoption is required'),
        sex: optionalString(),
        food: optionalString(),
        allergies: optionalString(),
        microchipId: optionalString(),
        microchipRegistry: optionalString(),
        registrationId: optionalString(),
        registrationNumber: optionalString(),
        registeredOn: Yup.mixed()
          .required('Registered on date is required')
          .test('is-valid-date', 'Invalid date', value => !!value),
        renewalDate: Yup.mixed()
          .required('Renewal date is required')
          .test(
            'is-after-registeredOn',
            'Renewal date must be after registered on date',
            function (value) {
              const { registeredOn } = this.parent;
              if (!value || !registeredOn) return true;
              return new Date(value as any) > new Date(registeredOn as any);
            },
          ),
        issuingAuthority: optionalString(),
        endDate: Yup.mixed()
          .nullable()
          .optional()
          .test(
            'is-after-dateOfAdoption',
            'End date must not be after date of adoption',
            function (value) {
              const { dateOfAdoption } = this.parent;
              if (!value || !dateOfAdoption) return true;
              return new Date(value as any) > new Date(dateOfAdoption as any);
            },
          ),
        photoUrls: Yup.array().of(Yup.string()).nullable(),
      });

    case 'pet_vaccination':
      return Yup.object().shape({
        vaccineName: requiredString('Vaccine name'),
        dateGiven: Yup.mixed().required('Date given is required'),
        nextDate: Yup.mixed()
          .nullable()
          .optional()
          .test(
            'is-after-dateGiven',
            'Next date must be after date given',
            function (value) {
              const { dateGiven } = this.parent;
              if (!value || !dateGiven) return true;
              const given = new Date(dateGiven);
              const next = new Date(value as any);
              return next > given;
            },
          ),
        photoUrls: Yup.array().of(Yup.string()).nullable(),
      });

    case 'pet_medication':
      return Yup.object().shape({
        name: requiredString('Medication name'),
        dose: requiredString('Dose'),
        doseUnit: requiredString('Dose unit'),
        scheduleType: requiredString('Schedule type'),
        times: optionalString(),
        intervals: optionalString(),
        intervalFrequency: optionalString(),
        intervalDate: Yup.mixed().nullable().optional(),
        intervalTime: Yup.mixed().nullable().optional(),
        startDate: Yup.mixed().required('Start date is required'),
        endDate: Yup.mixed().nullable().optional(),
        notes: optionalString(),
        photoUrls: Yup.array().of(Yup.string()).nullable(),
      });

    case 'pet_vet_appointment':
      return Yup.object().shape({
        date: Yup.mixed().required('Date is required'),
        time: requiredString('Time'),
        clinic: requiredString('Clinic name'),
        vet: optionalString(),
        reason: requiredString('Reason'),
        outcome: optionalString(),
        nextSteps: optionalString(),
        photoUrls: Yup.array().of(Yup.string()).nullable(),
        notes: optionalString(),
      });

    case 'pet_illness':
      return Yup.object().shape({
        date: Yup.mixed().required('Date is required'),
        diagnosis: requiredString('Diagnosis'),
        treatments: optionalString(),
        notes: optionalString(),
        photoUrls: Yup.array().of(Yup.string()).nullable(),
      });

    case 'child_illness':
      return Yup.object().shape({
        conditionName: requiredString('Condition / Diagnosis name'),
      });

    case 'child_surgery':
      return Yup.object().shape({
        procedureName: requiredString('Procedure / Surgery name'),
      });

    case 'medication':
      return Yup.object().shape({
        name: requiredString('Medication name'),
      });

    case 'appointment':
      return Yup.object().shape({
        startDate: Yup.mixed().required('Start date is required'),
        time: Yup.mixed().required('Time is required'),
        selectDoctor: optionalString(),
        location: requiredString('Location'),
        reason: optionalString(),
        outcome: optionalString(),
        task: optionalString(),
        dueDate: Yup.mixed().nullable(),
      });

    case 'subscription':
      // Subscriptions, Memberships & Passes: only the name, type and provider are required.
      return Yup.object().shape({
        subscriptionName: requiredString('Name'),
        type: requiredString('Type'),
        provider: requiredString('Provider / Organization'),
        memberName: optionalString(),
        membershipNumber: optionalString(),
        planTier: optionalString(),
        username: optionalString(),
        password: optionalString(),
        cost: Yup.number()
          .transform((value, original) => (original === '' || original == null ? undefined : value))
          .typeError('Cost must be a number')
          .min(0, 'Cost must be greater than or equal to 0')
          .nullable()
          .optional(),
        billingFrequency: optionalString(),
        nextRenewalDate: Yup.mixed()
          .nullable()
          .optional()
          .test(
            'nextRenewalDate-is-future',
            'Renewal date must be a future date (tomorrow or later)',
            function (value) {
              if (!value) return true;
              const tomorrow = new Date();
              tomorrow.setDate(tomorrow.getDate() + 1);
              tomorrow.setHours(0, 0, 0, 0);
              const selectedDate = new Date(value as string);
              selectedDate.setHours(0, 0, 0, 0);
              return selectedDate >= tomorrow;
            },
          ),
        paymentMethod: optionalString(),
        notes: optionalString(),
        startDate: Yup.mixed().nullable().optional(),
        endDate: Yup.mixed()
          .nullable()
          .optional()
          .test(
            'endDate-after-startDate',
            'Expiration date must be after the start date',
            function (value) {
              const { startDate, noExpiration } = this.parent;
              if (!value || !startDate || noExpiration) return true;
              return new Date(value as any) > new Date(startDate as any);
            },
          ),
      });

    // ─── Real Estate Schemas ───────────────────────────
    case 'real_state_overview':
      return Yup.object().shape({
        nickname: requiredString('Nickname'),
        type: requiredString('Property type'),
        streetAddress: requiredString('Street address'),
        aptSuite: optionalString(),
        city: requiredString('City'),
        state: requiredString('State'),
        zip: requiredString('Zip'),
        country: requiredString('Country'),
        purchaseDate: optionalDate(),
        purchasePrice: optionalNumber('Purchase price'),
        endSellDate: optionalDate().test(
          'endAfterPurchase',
          'End/Sell date must be after purchase date',
          function (value) {
            const { purchaseDate } = this.parent;
            if (!value || !purchaseDate) return true;
            return new Date(value) > new Date(purchaseDate);
          },
        ),
        estCurrentValue: optionalNumber('Current value'),
        attachmentUrl: optionalString(),
      });
    case 'real_state_loan':
      // Mirror the standalone `loan` module: only lender/provider, balance,
      // monthly payment, start date and due day are required.
      return Yup.object().shape({
        lenderProvider: requiredString('Lender/Provider'),
        lenderLocation: Yup.string().optional(),
        lenderPhoneNumber: Yup.string().optional(),
        lenderEmail: Yup.string().email('Please enter a valid email').optional(),
        accountNumber: Yup.string().optional(),
        balance: Yup.string().required('Balance is required'),
        estBalance: Yup.string().optional(),
        monthlyPayment: Yup.string().required('Monthly payment is required'),
        startDate: Yup.date().required('Start date is required'),
        endDate: Yup.date()
          .nullable()
          .notRequired()
          .test(
            'endDate-after-startDate',
            'End date must be greater than start date',
            function (value) {
              const { startDate } = this.parent;
              if (!value || !startDate) return true;
              return value > startDate;
            },
          ),
        dueDay: Yup.number()
          .required('Due day is required')
          .typeError('Due day must be a number')
          .integer('Due day must be a whole number')
          .min(1, 'Due day must be between 1 and 31')
          .max(31, 'Due day must be between 1 and 31'),
        ratePercent: Yup.number()
          .optional()
          .typeError('Rate must be a number')
          .min(0, 'Rate must be between 0% and 100%')
          .max(100, 'Rate must be between 0% and 100%'),
        bestName: Yup.string().optional(),
        uploadAttachments: Yup.mixed().nullable().optional(),
        realEstateId: Yup.number().nullable(),
        vehicleId: Yup.number().nullable(),
      });
    case 'real_state_utility':
      return Yup.object().shape({
        utilityType: requiredString('Utility type'),
        vendor: requiredString('Vendor'),
        averageMonthlyAmount: optionalNumber('Average monthly amount'),
        // endDate: Yup.mixed().optional(),
        accountNumber: optionalString(),
        dueDay: Yup.number()
          .typeError('Due day must be a number')
          .min(1, 'Due day must be between 1 and 31')
          .max(31, 'Due day must be between 1 and 31')
          .nullable(),
        phoneNumber: optionalString(),
        website: optionalUrl(),
        uploadAttachments: optionalString(),
        realEstateId: Yup.number().nullable(),
      });
    case 'real_state_insurance':
      // Mirror the standalone `add_insurance` module: only the item name is
      // required (plus due day when the policy is not paid annually).
      return Yup.object().shape({
        itemName: requiredString('Item name'),
        insuranceCarrier: optionalString(),
        policyNumber: optionalString(),
        annualPremium: optionalNumber('Annual premium'),
        agentEmail: optionalEmail(),
        startDate: optionalDate(),
        renewalDate: optionalDate().test(
          'renewalDate-after-startDate',
          'Renewal date must be after start date',
          function (value) {
            const { startDate } = this.parent;
            if (!value || !startDate) return true;
            const start = new Date(startDate as string);
            const end = new Date(value as string);
            return (
              !isNaN(start.getTime()) && !isNaN(end.getTime()) && end > start
            );
          },
        ),
        endDate: Yup.mixed().nullable().optional(),
        dueDay: Yup.number()
          .typeError('Due day must be a number')
          .integer('Due day must be a whole number')
          .min(1, 'Due day must be between 1 and 31')
          .max(31, 'Due day must be between 1 and 31')
          .nullable()
          .optional(),
        agent: Yup.string().nullable(),
        agentPhone: Yup.string().nullable(),
        uploadAttachments: optionalString(),
        realEstateId: Yup.number().nullable(),
        isPaidAnnually: Yup.boolean().nullable(),
      });
    case 'real_state_warranty':
      return Yup.object().shape({
        itemName: requiredString('Item name'),
        warrantyProvider: requiredString('Warranty provider'),
        startDate: Yup.mixed().nullable().optional(),
        expiration: Yup.mixed()
          .nullable()
          .optional()
          .test(
            'expiration-after-startDate',
            'Expiration date must be after start date',
            function (value) {
              const { startDate } = this.parent;
              if (!value || !startDate) return true;
              const start = new Date(startDate as string);
              const end = new Date(value as string);
              return (
                !isNaN(start.getTime()) && !isNaN(end.getTime()) && end > start
              );
            },
          ),
        notes: optionalString(),
        website: optionalUrl(),
        uploadAttachments: optionalString(),
        realEstateId: Yup.number().nullable(),
      });
    case 'real_state_personal_property':
      return Yup.object().shape({
        // ── Personal Property ──────────────────────────
        name: requiredString('Name').max(
          200,
          'Name cannot exceed 200 characters',
        ),
        category: Yup.string()
          .max(100, 'Category cannot exceed 100 characters')
          .nullable(),
        attachment: optionalString(),
        modelSerial: Yup.string()
          .max(100, 'Model/Serial cannot exceed 100 characters')
          .nullable(),
        purchaseDate: Yup.date().nullable(),
        soldAmount: Yup.number()
          .typeError('Sold amount must be a number')
          .min(0, 'Sold amount cannot be negative')
          .nullable(),
        price: Yup.number()
          .typeError('Price must be a number')
          .min(0, 'Price cannot be negative')
          .nullable(),
        dateSoldDiscarded: Yup.date()
          .nullable()
          .test(
            'after-purchase',
            'Date sold/discarded must be after purchase date',
            function (value) {
              const { purchaseDate } = this.parent;
              if (!value || !purchaseDate) return true;
              return new Date(value) > new Date(purchaseDate);
            },
          ),
        realEstateId: Yup.number().nullable(),

        // ── Warranty (optional section) ────────────────
        warrantyItemName: Yup.string()
          .max(200, 'Warranty item name cannot exceed 200 characters')
          .nullable(),
        warrantyProvider: Yup.string()
          .max(200, 'Warranty provider cannot exceed 200 characters')
          .nullable(),
        warrantyExpiration: Yup.date().nullable(),
        warrantyStartDate: optionalDate(),
        warrantyNotes: Yup.string()
          .max(1000, 'Warranty notes cannot exceed 1000 characters')
          .nullable(),
        warrantyWebsite: optionalUrl(),
        warrantyUploadAttachments: optionalString(),

        // ── Insurance (optional section) ───────────────
        insuranceItemName: Yup.string()
          .max(200, 'Insurance item name cannot exceed 200 characters')
          .nullable(),
        agentEmail: optionalEmail(),
        insuranceCarrier: Yup.string()
          .max(200, 'Insurance carrier cannot exceed 200 characters')
          .nullable(),
        policyNumber: Yup.string()
          .max(100, 'Policy number cannot exceed 100 characters')
          .nullable(),
        annualPremium: Yup.number()
          .typeError('Annual premium must be a number')
          .min(0, 'Annual premium must be >= 0')
          .nullable(),
        insuranceStartDate: optionalDate(),
        insuranceRenewalDate: optionalDate(),
        insuranceEndDate: optionalDate(),
        insuranceDueDay: Yup.number()
          .typeError('Due day must be a number')
          .min(1, 'Due day must be between 1 and 31')
          .max(31, 'Due day must be between 1 and 31')
          .nullable(),
        insuranceIsPaidAnnually: Yup.boolean().nullable(),
        insuranceAgent: optionalString(),
        insuranceAgentPhone: optionalString(),
        insuranceUploadAttachments: optionalString(),

        // ── Loan (optional section — all required if any field is filled) ─
        lenderProvider: Yup.string()
          .max(200, 'Lender provider cannot exceed 200 characters')
          .test(
            'loan-required',
            'Lender/Provider is required',
            function (value) {
              const p = this.parent;
              const loanTouched = [
                p.lenderLocation,
                p.lenderPhoneNumber,
                p.lenderEmail,
                p.accountNumber,
                p.balance,
                p.estBalance,
                p.monthlyPayment,
                p.loanStartDate,
                p.loanEndDate,
                p.loanDueDay,
                p.ratePercentage,
                p.loanItemName,
              ].some(f => f !== null && f !== undefined && f !== '');
              if (loanTouched && !value) return false;
              return true;
            },
          )
          .nullable(),
        lenderLocation: Yup.string()
          .test(
            'loan-required',
            'Lender location is required',
            function (value) {
              const p = this.parent;
              const loanTouched = [
                p.lenderProvider,
                p.lenderPhoneNumber,
                p.lenderEmail,
                p.accountNumber,
                p.balance,
                p.estBalance,
                p.monthlyPayment,
                p.loanStartDate,
                p.loanEndDate,
                p.loanDueDay,
                p.ratePercentage,
                p.loanItemName,
              ].some(f => f !== null && f !== undefined && f !== '');
              if (loanTouched && !value) return false;
              return true;
            },
          )
          .nullable(),
        lenderPhoneNumber: Yup.string()
          .test(
            'loan-required',
            'Lender phone number is required',
            function (value) {
              const p = this.parent;
              const loanTouched = [
                p.lenderProvider,
                p.lenderLocation,
                p.lenderEmail,
                p.accountNumber,
                p.balance,
                p.estBalance,
                p.monthlyPayment,
                p.loanStartDate,
                p.loanEndDate,
                p.loanDueDay,
                p.ratePercentage,
                p.loanItemName,
              ].some(f => f !== null && f !== undefined && f !== '');
              if (loanTouched && !value) return false;
              return true;
            },
          )
          .nullable(),
        lenderEmail: Yup.string()
          .email('Please enter a valid email')
          .test('loan-required', 'Lender email is required', function (value) {
            const p = this.parent;
            const loanTouched = [
              p.lenderProvider,
              p.lenderLocation,
              p.lenderPhoneNumber,
              p.accountNumber,
              p.balance,
              p.estBalance,
              p.monthlyPayment,
              p.loanStartDate,
              p.loanEndDate,
              p.loanDueDay,
              p.ratePercentage,
              p.loanItemName,
            ].some(f => f !== null && f !== undefined && f !== '');
            if (loanTouched && !value) return false;
            return true;
          })
          .nullable(),
        accountNumber: Yup.string()
          .max(50, 'Account number cannot exceed 50 characters')
          .test(
            'loan-required',
            'Account number is required',
            function (value) {
              const p = this.parent;
              const loanTouched = [
                p.lenderProvider,
                p.lenderLocation,
                p.lenderPhoneNumber,
                p.lenderEmail,
                p.balance,
                p.estBalance,
                p.monthlyPayment,
                p.loanStartDate,
                p.loanEndDate,
                p.loanDueDay,
                p.ratePercentage,
                p.loanItemName,
              ].some(f => f !== null && f !== undefined && f !== '');
              if (loanTouched && !value) return false;
              return true;
            },
          )
          .nullable(),
        balance: Yup.number()
          .typeError('Balance must be a number')
          .min(0, 'Balance cannot be negative')
          .test('loan-required', 'Balance is required', function (value) {
            const p = this.parent;
            const loanTouched = [
              p.lenderProvider,
              p.lenderLocation,
              p.lenderPhoneNumber,
              p.lenderEmail,
              p.accountNumber,
              p.estBalance,
              p.monthlyPayment,
              p.loanStartDate,
              p.loanEndDate,
              p.loanDueDay,
              p.ratePercentage,
              p.loanItemName,
            ].some(f => f !== null && f !== undefined && f !== '');
            if (loanTouched && (value === null || value === undefined))
              return false;
            return true;
          })
          .nullable(),
        estBalance: Yup.number()
          .typeError('Est. balance must be a number')
          .min(0, 'Est. balance cannot be negative')
          .test('loan-required', 'Est. balance is required', function (value) {
            const p = this.parent;
            const loanTouched = [
              p.lenderProvider,
              p.lenderLocation,
              p.lenderPhoneNumber,
              p.lenderEmail,
              p.accountNumber,
              p.balance,
              p.monthlyPayment,
              p.loanStartDate,
              p.loanEndDate,
              p.loanDueDay,
              p.ratePercentage,
              p.loanItemName,
            ].some(f => f !== null && f !== undefined && f !== '');
            if (loanTouched && (value === null || value === undefined))
              return false;
            return true;
          })
          .nullable(),
        monthlyPayment: Yup.number()
          .typeError('Monthly payment must be a number')
          .min(0, 'Monthly payment must be >= 0')
          .test(
            'loan-required',
            'Monthly payment is required',
            function (value) {
              const p = this.parent;
              const loanTouched = [
                p.lenderProvider,
                p.lenderLocation,
                p.lenderPhoneNumber,
                p.lenderEmail,
                p.accountNumber,
                p.balance,
                p.estBalance,
                p.loanStartDate,
                p.loanEndDate,
                p.loanDueDay,
                p.ratePercentage,
                p.loanItemName,
              ].some(f => f !== null && f !== undefined && f !== '');
              if (loanTouched && (value === null || value === undefined))
                return false;
              return true;
            },
          )
          .nullable(),
        loanStartDate: Yup.date()
          .test('loan-required', 'Start date is required', function (value) {
            const p = this.parent;
            const loanTouched = [
              p.lenderProvider,
              p.lenderLocation,
              p.lenderPhoneNumber,
              p.lenderEmail,
              p.accountNumber,
              p.balance,
              p.estBalance,
              p.monthlyPayment,
              p.loanDueDay,
              p.ratePercentage,
              p.loanItemName,
            ].some(f => f !== null && f !== undefined && f !== '');
            if (loanTouched && !value) return false;
            return true;
          })
          .nullable(),
        loanEndDate: Yup.date()
          .test(
            'loan-end-after-start',
            'End date must be after start date',
            function (value) {
              const { loanStartDate } = this.parent;
              if (!value || !loanStartDate) return true;
              return new Date(value) > new Date(loanStartDate);
            },
          )
          .nullable(),
        loanDueDay: Yup.number()
          .typeError('Due day must be a number')
          .integer('Due day must be a whole number')
          .min(1, 'Due day must be between 1 and 31')
          .max(31, 'Due day must be between 1 and 31')
          .test('loan-required', 'Due day is required', function (value) {
            const p = this.parent;
            const loanTouched = [
              p.lenderProvider,
              p.lenderLocation,
              p.lenderPhoneNumber,
              p.lenderEmail,
              p.accountNumber,
              p.balance,
              p.estBalance,
              p.monthlyPayment,
              p.loanStartDate,
              p.loanEndDate,
              p.ratePercentage,
              p.loanItemName,
            ].some(f => f !== null && f !== undefined && f !== '');
            if (loanTouched && (value === null || value === undefined))
              return false;
            return true;
          })
          .nullable(),
        ratePercentage: Yup.number()
          .typeError('Rate % must be a number')
          .min(0, 'Rate % cannot be negative')
          .max(100, 'Rate % cannot exceed 100')
          .test('loan-required', 'Rate % is required', function (value) {
            const p = this.parent;
            const loanTouched = [
              p.lenderProvider,
              p.lenderLocation,
              p.lenderPhoneNumber,
              p.lenderEmail,
              p.accountNumber,
              p.balance,
              p.estBalance,
              p.monthlyPayment,
              p.loanStartDate,
              p.loanEndDate,
              p.loanDueDay,
              p.loanItemName,
            ].some(f => f !== null && f !== undefined && f !== '');
            if (loanTouched && (value === null || value === undefined))
              return false;
            return true;
          })
          .nullable(),
        loanItemName: Yup.string()
          .test('loan-required', 'Item name is required', function (value) {
            const p = this.parent;
            const loanTouched = [
              p.lenderProvider,
              p.lenderLocation,
              p.lenderPhoneNumber,
              p.lenderEmail,
              p.accountNumber,
              p.balance,
              p.estBalance,
              p.monthlyPayment,
              p.loanStartDate,
              p.loanEndDate,
              p.loanDueDay,
              p.ratePercentage,
            ].some(f => f !== null && f !== undefined && f !== '');
            if (loanTouched && !value) return false;
            return true;
          })
          .nullable(),
        loanUploadAttachments: optionalString(),
      });
    case 'real_state_services':
      return Yup.object().shape({
        date: Yup.mixed().required('Date is required'),
        vendorContractor: requiredString('Vendor/Contractor'),
        cost: Yup.number()
          .required('Cost is required')
          .typeError('Cost must be a number')
          .min(0, 'Cost must be positive'),
        tags: optionalString(),
        // description: requiredString('Description'),
        description: optionalString(),
        attachment: optionalString(),
        realEstateId: Yup.number().nullable(),
      });

    // ─── Vehicle Schemas ────────────────────────────────
    case 'add_vehicle':
      return Yup.object().shape({
        year: Yup.string()
          .required('Year is required')
          .matches(/^\d{4}$/, 'Year must be a 4-digit number'),
        make: requiredString('Make'),
        model: requiredString('Model'),
        nickname: optionalString(),
        vin: optionalString(),
        color: optionalString(),
        plate: optionalString(),
        registrationTypeOther: optionalString(),
        registeredAddress: optionalString(),
        purchasedPrice: Yup.string()
          .optional()
          .matches(/^\d*\.?\d*$/, 'Purchased price must be a valid number')
          .nullable(),
        notes: optionalString(),
      });
    case 'add_service_record':
      return Yup.object().shape({
        date: Yup.string().required('Date is required').nullable(),
        type: Yup.array().of(Yup.string()).min(1, 'Service type is required').required('Service type is required'),
        vendorShop: optionalString(),
        odometer: Yup.string()
          .optional()
          .matches(/^\d*\.?\d*$/, 'Odometer must be a valid number'),
        cost: Yup.string()
          .optional()
          .matches(/^\d*\.?\d*$/, 'Cost must be a valid number'),
        notes: optionalString(),
      });

    case 'vehicle_accident':
      return Yup.object().shape({
        date: Yup.mixed().required('Date is required'),
        claimNumber: optionalString(),
        insuranceType: requiredString('Insurance type'),
        damage: requiredString('Damage'),
        repairDateStart: Yup.mixed().nullable(),
        repairDateEnd: Yup.mixed().nullable(),
        shop: optionalString(),
        totalRepairCost: optionalString(),
      });

    // ─── Business Contact Schema ──────────────────────────────────
    case 'business_contact':
      return Yup.object().shape({
        fullName: Yup.string()
          .required('Full name is required')
          .max(100, 'Full name cannot exceed 100 characters'),

        role: Yup.string()
          .max(100, 'Role cannot exceed 100 characters')
          .nullable(),

        companyTeam: Yup.string().nullable(),

        status: Yup.string().nullable(),

        emailAddress: Yup.string()
          .email('Please provide a valid email address')
          .max(255, 'Email cannot exceed 255 characters')
          .nullable(),

        phoneNumber: Yup.string()
          .matches(/^\+?[1-9]\d{1,14}$/, 'Please provide a valid phone number')
          .nullable(),

        manager: Yup.string().nullable(),

        location: Yup.string()
          .max(200, 'Location cannot exceed 200 characters')
          .nullable(),

        tags: Yup.string()
          .max(500, 'Tags cannot exceed 500 characters')
          .nullable(),

        primary: Yup.string().nullable(),

        contactType: Yup.string().nullable(),

        reference: Yup.boolean(),
      });

    case 'business_project':
      return Yup.object().shape({
        projectName: Yup.string()
          .required('Project name is required')
          .max(200, 'Project name cannot exceed 200 characters'),

        description: Yup.string()
          .max(1000, 'Description cannot exceed 1000 characters')
          .nullable(),

        clients: options?.requireContact === false
          ? Yup.array().of(Yup.string()).nullable()
          : Yup.array().of(Yup.string()).min(1, 'At least one client is required').required('Client is required'),

        startDate: Yup.string().nullable(),

        endDate: Yup.string().nullable(),

        projectStatus: Yup.string().nullable(),

        amount: Yup.string().nullable(),

        notes: Yup.string()
          .max(1000, 'Notes cannot exceed 1000 characters')
          .nullable(),
      });

    case 'add_utility':
      return Yup.object({
        utilityType: Yup.string().required(
          t('utilities.utility_type_required'),
        ),
        vendor: Yup.string().required(t('utilities.vendor_required')),
        averageMonthlyAmount: Yup.string()
          .matches(/^\d+(\.\d+)?$/, t('utilities.invalid_amount'))
          .required(t('utilities.amount_required')),
        startDate: Yup.mixed().nullable().optional(),
        endDate: Yup.mixed()
          .nullable()
          .optional()
          .test(
            'end-after-start',
            t('utilities.end_date_after_start'),
            function (value) {
              const { startDate } = this.parent;
              if (!value || !startDate) return true;
              return new Date(value as any) > new Date(startDate as any);
            },
          ),
        accountNumber: Yup.string(),
        dueDay: Yup.string()
          .matches(/^\d*$/, t('utilities.invalid_due_day'))
          .test(
            'dueDayRange',
            'Due day must be between 1 and 31',
            function (value) {
              if (!value) return true;
              const day = parseInt(value, 10);
              return day >= 1 && day <= 31;
            },
          ),
        phone: Yup.string(),
        website: Yup.string()
          .nullable()
          .optional()
          .test('validUrl', t('utilities.invalid_website'), function (value) {
            if (!value) return true; // Allow empty
            // Accept URLs with or without protocol, or just domain names
            const urlRegex =
              /^(https?:\/\/)?(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z]{2,}(\S*)$/;
            return urlRegex.test(value);
          }),
        uploadAttachments: Yup.string().nullable().optional(),
      });
    case 'business_license':
      return Yup.object().shape({
        vendorProvider: Yup.string()
          .required('Vendor/Provider is required')
          .min(2, 'Vendor/Provider must be at least 2 characters'),
        product: Yup.string()
          .required('Product is required')
          .min(2, 'Product must be at least 2 characters'),
        plan: Yup.string()
          .required('Plan is required')
          .min(2, 'Plan must be at least 2 characters'),
        seats: Yup.number()
          .typeError('Seats must be a number')
          .required('Seats is required')
          .positive('Seats must be a positive number'),
        renewalDate: Yup.string().required('Renewal date is required'),
        autoRenew: Yup.string().required('Auto-renew option is required'),
        cost: Yup.number()
          .typeError('Cost must be a number')
          .required('Cost is required')
          .positive('Cost must be a positive number'),
        period: Yup.string().required('Period is required'),
        licenseKey: Yup.string().required('License key is required'),
        notes: Yup.string().optional(),
        username: Yup.string().optional(),
        password: Yup.string().optional(),
      });

    case 'compliance_folder':
      return Yup.object().shape({
        folderName: Yup.string()
          .required('Folder name is required')
          .min(2, 'Folder name must be at least 2 characters'),
      });

    case 'compliance_record':
      return Yup.object().shape({
        title: Yup.string()
          .required('Title is required')
          .min(2, 'Title must be at least 2 characters')
          .max(200, 'Title cannot exceed 200 characters'),
        complianceType: Yup.string().required('Compliance type is required'),
        status: Yup.string().required('Status is required'),
        dueDate: Yup.string().required('Due / Expiration date is required'),
        notes: Yup.string().nullable().optional(),
      });

    case 'add_insurance':
      return Yup.object().shape({
        itemName: Yup.string().required('Item name is required'),
        insuranceCarrier: optionalString(),
        policyNumber: optionalString(),
        annualPremium: optionalNumber('Annual premium'),
        agentEmail: optionalEmail(),
        startDate: optionalDate(),
        renewalDate: optionalDate().test(
          'renewalAfterStart',
          'Renewal date must be after start date',
          function (value) {
            const { startDate } = this.parent;
            if (!value || !startDate) return true;
            return (
              new Date(value as string | Date) >
              new Date(startDate as string | Date)
            );
          },
        ),
        endDate: optionalDate().test(
          'endDate-after-startDate',
          'End date must be after start date',
          function (value) {
            const { startDate } = this.parent;
            if (!value || !startDate) return true;
            return (
              new Date(value as string | Date) >
              new Date(startDate as string | Date)
            );
          },
        ),
        dueDay: Yup.number()
          .typeError('Due day must be a number')
          .min(1, 'Due day must be between 1 and 31')
          .max(31, 'Due day must be between 1 and 31')
          .nullable()
          .optional(),
        agent: optionalString(),
        agentPhone: optionalString(),
        uploadAttachments: Yup.mixed().nullable().optional(),
        isPaidAnnually: Yup.boolean().nullable(),
      });

    case 'vehicle_warranty':
      return Yup.object().shape({
        itemName: requiredString('Item name'),
        warrantyProvider: requiredString('Warranty provider'),
        startDate: Yup.mixed().required('Start date is required'),
        expiration: Yup.mixed()
          .nullable()
          .optional()
          .test(
            'expiration-after-startDate',
            'Expiration date must be after start date',
            function (value) {
              const { startDate } = this.parent;
              if (!value || !startDate) return true;
              const start = new Date(startDate as string);
              const end = new Date(value as string);
              return (
                !isNaN(start.getTime()) && !isNaN(end.getTime()) && end > start
              );
            },
          ),
        notes: Yup.string().nullable(),
        website: Yup.string()
          .nullable()
          .matches(
            /^$|^(https?:\/\/)?(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z]{2,}(\S*)$/,
            'Please enter a valid website URL',
          ),
        uploadAttachments: Yup.mixed().nullable().optional(),
      });

    case 'vehicle_insurance':
      // Mirror the `add_insurance` / `real_state_insurance` modules: only the
      // item name is required; every other field is optional. Keeps add & edit
      // consistent across all insurance screens.
      return Yup.object().shape({
        itemName: requiredString('Item name'),
        agentEmail: optionalEmail(),
        insuranceCarrier: requiredString('Insurance carrier is required'),
        policyNumber: requiredString('Policy number is required'),
        annualPremium: optionalNumber('Annual premium'),
        startDate: Yup.date().required('Start date is required'),
        renewalDate: Yup.date().required('Renewal date is required').test(
          'renewalDate-after-startDate',
          'Renewal date must be after start date',
          function (value) {
            const { startDate } = this.parent;
            if (!value || !startDate) return true;
            const start = new Date(startDate as string);
            const end = new Date(value as string);
            return (
              !isNaN(start.getTime()) && !isNaN(end.getTime()) && end > start
            );
          },
        ),
        endDate: Yup.date().nullable().optional().test(
          'endDate-after-startDate',
          'End date must be after start date',
          function (value) {
            const { startDate } = this.parent;
            if (!value || !startDate) return true;
            const start = new Date(startDate as string);
            const end = new Date(value as string);
            return (
              !isNaN(start.getTime()) && !isNaN(end.getTime()) && end > start
            );
          },
        ),
        dueDay: Yup.number()
          .typeError('Due day must be a number')
          .integer('Due day must be a whole number')
          .min(1, 'Due day must be between 1 and 31')
          .max(31, 'Due day must be between 1 and 31')
          .nullable()
          .optional(),
        agent: Yup.string().nullable(),
        agentPhone: Yup.string().nullable(),
        uploadAttachments: Yup.mixed().nullable().optional(),
        isPaidAnnually: Yup.boolean().nullable(),
      });

    case 'warranty':
      return Yup.object().shape({
        itemName: requiredString('Item name'),
        warrantyProvider: requiredString('Warranty provider'),
        startDate: Yup.mixed().nullable().optional(),
        expiration: Yup.mixed()
          .nullable()
          .optional()
          .test(
            'expiration-after-startDate',
            'Expiration date must be after start date',
            function (value) {
              const { startDate } = this.parent;
              if (!value || !startDate) return true;
              const start = new Date(startDate as string);
              const end = new Date(value as string);
              return (
                !isNaN(start.getTime()) && !isNaN(end.getTime()) && end > start
              );
            },
          ),
        notes: Yup.string().nullable(),
        website: Yup.string()
          .nullable()
          .matches(
            /^$|^(https?:\/\/)?(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z]{2,}(\S*)$/,
            'Please enter a valid website URL',
          ),
        uploadAttachments: Yup.string().nullable().optional(),
      });

    case 'add_ad_hoc_reminder':
      return Yup.object().shape({
        description: requiredString('Description'),
        frequency: Yup.string().required('Frequency is required'),
        time: Yup.mixed().nullable().optional(),
        startDate: Yup.mixed()
          .nullable()
          .when('frequency', {
            is: (f: string) => f !== 'custom',
            then: schema => {
              let s = schema.required('Start date is required');
              if (!isEditMode) {
                s = s.test('startDate-not-past', 'Start date cannot be in the past', function (value) {
                  if (!value) return true;
                  const start = new Date(value as any);
                  const today = new Date();
                  start.setHours(0, 0, 0, 0);
                  today.setHours(0, 0, 0, 0);
                  return start >= today;
                });
              }
              return s;
            },
            otherwise: schema => schema.nullable().optional(),
          }),
        endDate: Yup.mixed()
          .nullable()
          .when('frequency', {
            is: (f: string) => f !== 'custom',
            then: schema => {
              let s = schema.nullable().optional();
              if (!isEditMode) {
                s = s.test('endDate-not-past', 'End date cannot be in the past', function (value) {
                  if (!value) return true;
                  const end = new Date(value as any);
                  const today = new Date();
                  end.setHours(0, 0, 0, 0);
                  today.setHours(0, 0, 0, 0);
                  return end >= today;
                });
              }
              return s.test(
                'endDate-after-startDate',
                'End date must be after start date',
                function (value) {
                  const { startDate } = this.parent;
                  if (!value || !startDate) return true;
                  const start = new Date(startDate as any);
                  const end = new Date(value as any);
                  // Compare calendar dates only (ignore time component)
                  start.setHours(0, 0, 0, 0);
                  end.setHours(0, 0, 0, 0);
                  return end > start;
                },
              )
                .test(
                  'endDate-daily-range',
                  'For daily reminders, the end date must be at least 1 day after the start date.',
                  function (value) {
                    const { startDate, frequency } = this.parent;
                    if (!value || !startDate || frequency !== 'daily') return true;
                    const start = new Date(startDate as any);
                    const end = new Date(value as any);
                    start.setHours(0, 0, 0, 0);
                    end.setHours(0, 0, 0, 0);
                    const diff = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
                    return diff >= 1;
                  },
                )
                .test(
                  'endDate-weekly-range',
                  'For weekly reminders, the date range must be at least 7 days.',
                  function (value) {
                    const { startDate, frequency } = this.parent;
                    if (!value || !startDate || frequency !== 'weekly') return true;
                    const diff = (new Date(value as any).getTime() - new Date(startDate as any).getTime()) / (1000 * 60 * 60 * 24);
                    return diff >= 7;
                  },
                )
                .test(
                  'endDate-monthly-range',
                  'For monthly reminders, the date range must be at least 30 days.',
                  function (value) {
                    const { startDate, frequency } = this.parent;
                    if (!value || !startDate || frequency !== 'monthly') return true;
                    const diff = (new Date(value as any).getTime() - new Date(startDate as any).getTime()) / (1000 * 60 * 60 * 24);
                    return diff >= 30;
                  },
                );
            },
            otherwise: schema => schema.nullable().optional(),
          }),
        customDate: Yup.mixed()
          .nullable()
          .when('frequency', {
            is: 'custom',
            then: schema => {
              let s = schema.required('Date is required');
              if (!isEditMode) {
                s = s.test('customDate-not-past', 'Date cannot be in the past', function (value) {
                  if (!value) return true;
                  const d = new Date(value as any);
                  const today = new Date();
                  d.setHours(0, 0, 0, 0);
                  today.setHours(0, 0, 0, 0);
                  return d >= today;
                });
              }
              return s;
            },
            otherwise: schema => schema.nullable().optional(),
          }),
        time: Yup.mixed()
          .required('Time is required')
          .test('time-not-past', 'Time cannot be in the past for today', function (value) {
            if (isEditMode || !value) return true;

            const { frequency, startDate, customDate } = this.parent;

            let dateToCompare: Date | null = null;
            if (frequency === 'custom' && customDate) {
              dateToCompare = new Date(customDate as any);
            } else if (frequency !== 'custom' && startDate) {
              dateToCompare = new Date(startDate as any);
            }

            if (!dateToCompare) return true;
            if (isNaN(dateToCompare.getTime())) return true;

            const today = new Date();
            dateToCompare.setHours(0, 0, 0, 0);
            today.setHours(0, 0, 0, 0);

            // If the date is strictly in the future, time doesn't matter
            if (dateToCompare > today) return true;

            // If the date is today, check if time is past
            if (dateToCompare.getTime() === today.getTime()) {
              const timeObj = new Date(value as any);
              if (isNaN(timeObj.getTime())) return true;

              const currentHours = new Date().getHours();
              const currentMinutes = new Date().getMinutes();
              const selectedHours = timeObj.getHours();
              const selectedMinutes = timeObj.getMinutes();

              if (selectedHours < currentHours) return false;
              if (selectedHours === currentHours && selectedMinutes < currentMinutes) return false;
            }

            return true;
          }),
      });

    default:
      return Yup.object().shape({});
  }
};

export default validationSchema;
