import { ASYNC_STATUS } from '../../config/constants';
import { User } from '../authTypes/Login.types';

export type AsyncStatusType = (typeof ASYNC_STATUS)[keyof typeof ASYNC_STATUS];

// Common API Response Type
export interface ApiResponse<T = any> {
    data: T;
    message?: string;
    success?: boolean;
}



// Complete EssentialsState interface
export interface EssentialsState {
    // ==================== Bookmark API Initial States Types ====================


    bookmarks_status: AsyncStatusType,
    bookmarks_data: any,
    bookmarks_error: string | null | undefined;

    create_bookmark_status: AsyncStatusType,
    create_bookmark_data: any,
    create_bookmark_error: string | null | undefined;

    update_bookmark_status: AsyncStatusType,
    update_bookmark_data: any,
    update_bookmark_error: string | null | undefined;

    delete_bookmark_status: AsyncStatusType,
    delete_bookmark_data: any,
    delete_bookmark_error: string | null | undefined;

    // ====================  Social Network API Initial States Types ====================

    social_network_types_status: AsyncStatusType;
    social_network_types_data: SocialNetworkTypesResponse | null;
    social_network_types_error: string | null | undefined;

    social_network_setup_status: AsyncStatusType;
    social_network_setup_data: SocialNetworkSetupResponse | null;
    social_network_setup_error: string | null | undefined;

    update_social_network_setup_status: AsyncStatusType;
    update_social_network_setup_data: SocialNetworkSetupResponse | null;
    update_social_network_setup_error: string | null | undefined;

    user_social_networks_status: AsyncStatusType;
    user_social_networks_data: UserSocialNetworksResponse | null;
    user_social_networks_error: string | null | undefined;

    // ====================  Legal Document API Initial States Types ====================


    legal_documents_status: AsyncStatusType,
    legal_documents_data: any,
    legal_documents_error: string | null | undefined;

    create_legal_document_status: AsyncStatusType,
    create_legal_document_data: any,
    create_legal_document_error: string | null | undefined;

    update_legal_document_status: AsyncStatusType,
    update_legal_document_data: any,
    update_legal_document_error: string | null | undefined;

    delete_legal_document_status: AsyncStatusType,
    delete_legal_document_data: any,
    delete_legal_document_error: string | null | undefined;

    // ====================  Subscriptions API Initial States Types ====================


    subscriptions_status: AsyncStatusType
    subscriptions_data: any,
    subscriptions_error: string | null | undefined,

    create_subscription_status: AsyncStatusType
    create_subscription_data: any,
    create_subscription_error: string | null | undefined,

    update_subscription_status: AsyncStatusType
    update_subscription_data: any,
    update_subscription_error: string | null | undefined,

    delete_subscription_status: AsyncStatusType
    delete_subscription_data: any,
    delete_subscription_error: string | null | undefined,

    // ====================  Health Tracker - Children API Initial States Types ====================

    get_children_status: AsyncStatusType;
    get_children_data: any;
    get_children_error: string | null | undefined;

    get_children_as_caregiver_status: AsyncStatusType;
    get_children_as_caregiver_data: any;
    get_children_as_caregiver_error: string | null | undefined;

    get_child_by_id_status: AsyncStatusType;
    get_child_by_id_data: any;
    get_child_by_id_error: string | null | undefined;

    add_child_status: AsyncStatusType;
    add_child_data: any;
    add_child_error: string | null | undefined;

    update_child_status: AsyncStatusType;
    update_child_data: any;
    update_child_error: string | null | undefined;

    delete_child_status: AsyncStatusType;
    delete_child_data: any;
    delete_child_error: string | null | undefined;

    // ====================  Health Tracker - Child Medications API Initial States Types ====================

    add_child_medication_status: AsyncStatusType;
    add_child_medication_data: any;
    add_child_medication_error: string | null | undefined;

    // ====================  Health Tracker - Child Doctors API Initial States Types ====================

    get_child_doctors_status: AsyncStatusType;
    get_child_doctors_data: any;
    get_child_doctors_error: string | null | undefined;

    add_child_doctor_status: AsyncStatusType;
    add_child_doctor_data: any;
    add_child_doctor_error: string | null | undefined;

    get_child_doctor_by_id_status: AsyncStatusType;
    get_child_doctor_by_id_data: any;
    get_child_doctor_by_id_error: string | null | undefined;

    update_child_doctor_status: AsyncStatusType;
    update_child_doctor_data: any;
    update_child_doctor_error: string | null | undefined;

    delete_child_doctor_status: AsyncStatusType;
    delete_child_doctor_data: any;
    delete_child_doctor_error: string | null | undefined;

    // ====================  Health Tracker - Child Caregivers API Initial States Types ====================

    add_child_caregiver_status: AsyncStatusType;
    add_child_caregiver_data: any;
    add_child_caregiver_error: string | null | undefined;

    update_child_caregiver_status: AsyncStatusType;
    update_child_caregiver_data: any;
    update_child_caregiver_error: string | null | undefined;

    delete_child_caregiver_status: AsyncStatusType;
    delete_child_caregiver_data: any;
    delete_child_caregiver_error: string | null | undefined;

    update_child_medication_status: AsyncStatusType;
    update_child_medication_data: any;
    update_child_medication_error: string | null | undefined;

    delete_child_medication_status: AsyncStatusType;
    delete_child_medication_data: any;
    delete_child_medication_error: string | null | undefined;

    // ====================  Health Tracker - Child Appointments API Initial States Types ====================

    add_child_appointment_status: AsyncStatusType;
    add_child_appointment_data: any;
    add_child_appointment_error: string | null | undefined;

    update_child_appointment_status: AsyncStatusType;
    update_child_appointment_data: any;
    update_child_appointment_error: string | null | undefined;

    delete_child_appointment_status: AsyncStatusType;
    delete_child_appointment_data: any;
    delete_child_appointment_error: string | null | undefined;

    // ====================  Wallet API Initial States Types ====================

    wallet_status: AsyncStatusType;
    wallet_data: WalletData | null;
    wallet_error: string | null | undefined;

    // ====================  Pets API Initial States Types ====================

    get_pets_status: AsyncStatusType;
    get_pets_data: any;
    get_pets_error: string | null | undefined;

    add_pet_status: AsyncStatusType;
    add_pet_data: any;
    add_pet_error: string | null | undefined;

    delete_pet_status: AsyncStatusType;
    delete_pet_data: any;
    delete_pet_error: string | null | undefined;

    add_pet_vaccination_status: AsyncStatusType;
    add_pet_vaccination_data: any;
    add_pet_vaccination_error: string | null | undefined;

    edit_pet_vaccination_status: AsyncStatusType;
    edit_pet_vaccination_data: any;
    edit_pet_vaccination_error: string | null | undefined;

    delete_pet_vaccination_status: AsyncStatusType;
    delete_pet_vaccination_data: any;
    delete_pet_vaccination_error: string | null | undefined;

    add_pet_medication_status: AsyncStatusType;
    add_pet_medication_data: any;
    add_pet_medication_error: string | null | undefined;

    edit_pet_medication_status: AsyncStatusType;
    edit_pet_medication_data: any;
    edit_pet_medication_error: string | null | undefined;

    edit_pet_status: AsyncStatusType;
    edit_pet_data: any;
    edit_pet_error: string | null | undefined;

    delete_pet_medication_status: AsyncStatusType;
    delete_pet_medication_data: any;
    delete_pet_medication_error: string | null | undefined;

    add_pet_vet_appointment_status: AsyncStatusType;
    add_pet_vet_appointment_data: any;
    add_pet_vet_appointment_error: string | null | undefined;

    edit_pet_vet_appointment_status: AsyncStatusType;
    edit_pet_vet_appointment_data: any;
    edit_pet_vet_appointment_error: string | null | undefined;

    delete_pet_vet_appointment_status: AsyncStatusType;
    delete_pet_vet_appointment_data: any;
    delete_pet_vet_appointment_error: string | null | undefined;

    add_pet_illness_status: AsyncStatusType;
    add_pet_illness_data: any;
    add_pet_illness_error: string | null | undefined;

    edit_pet_illness_status: AsyncStatusType;
    edit_pet_illness_data: any;
    edit_pet_illness_error: string | null | undefined;

    delete_pet_illness_status: AsyncStatusType;
    delete_pet_illness_data: any;
    delete_pet_illness_error: string | null | undefined;

    // ====================  App Tabs API Initial States Types ====================

    get_app_tabs_status: AsyncStatusType;
    get_app_tabs_data: ApiAppTabCategory[] | null;
    get_app_tabs_error: string | null | undefined;

    get_favorite_tabs_status: AsyncStatusType;
    get_favorite_tabs_data: ApiAppTab[] | null;
    get_favorite_tabs_error: string | null | undefined;

    
    favorite_tab_order: string[] | null;

    add_favorite_tab_status: AsyncStatusType;
    add_favorite_tab_data: any;
    add_favorite_tab_error: string | null | undefined;

    delete_favorite_tab_status: AsyncStatusType;
    delete_favorite_tab_data: any;
    delete_favorite_tab_error: string | null | undefined;

    wallet_toggle_status: AsyncStatusType;
    wallet_toggle_error: string | null | undefined;
}

// ====================  App Tabs API Types ====================

export interface ApiAppTab {
    id: number;
    name: string;
    icon: string;
    route: string;
    tabcategoryid: number;
    categoryname: string;
    displayorder: number;
    isfavorite: boolean;
}

export interface ApiAppTabCategory {
    id: number;
    name: string;
    apptabs: ApiAppTab[];
}

// ==================== Wallet API Types ====================

export interface WalletPassport {
    id: number;
    userid: number;
    passportnumber: string;
    countryid: number;
    country?: { id: number; countryname: string };
    expirationdate: string;
    imageurl?: string;
    isaddedinwallet: boolean;
    passporttype?: string;
    reminders?: any[];
    sharedwith?: any;
    createdat?: string;
    updatedat?: string;
}

export interface WalletDriverLicense {
    id: number;
    userid: number;
    licensenumber: string;
    state?: string;
    expirationdate: string;
    imageurl?: string;
    isaddedinwallet: boolean;
    class?: string;
    reminders?: any[];
    sharedwith?: any;
    createdat?: string;
    updatedat?: string;
}

export interface WalletLicenseCertification {
    id: number;
    userid: number;
    licensenumber: string;
    type: string;
    jurisdiction?: string;
    expirationdate: string;
    imageurl?: string;
    isaddedinwallet: boolean;
    issuerauthority?: string;
    reminders?: any[];
    sharedwith?: any;
    createdat?: string;
    updatedat?: string;
}

export interface WalletBankAccount {
    id: number;
    userid: number;
    [key: string]: any;
}

export interface WalletProperty {
    id: number;
    userid: number;
    name: string;
    category?: string;
    attachment?: string;
    purchasedate?: string;
    price?: number;
    isaddedtowallet?: boolean;
    [key: string]: any;
}

export interface WalletData {
    passports: WalletPassport[];
    driverlicenses: WalletDriverLicense[];
    licensescertifications: WalletLicenseCertification[];
    bankaccounts: WalletBankAccount[];
    properties: WalletProperty[];
    /** Memberships and passes flagged Add to Wallet (keys are lowercase). */
    subscriptions?: any[];
}



// Social Network Type from API
export interface SocialNetworkType {
    id: number | string;
    name: string;
    icon?: string;
    [key: string]: any;
}

// Social Network Types Response
export interface SocialNetworkTypesResponse {
    socialnetworktypes?: SocialNetworkType[];
    message?: string;
    [key: string]: any;
}

// User Social Network Account
export interface UserSocialNetworkSetup {
    id: number;
    accountname?: string;
    socialnetworktypeid?: string | number;
    socialnetworktypename?: string;
    username?: string;
    password?: string;
    url?: string;
    createdat?: string;
    updatedat?: string;
    [key: string]: any;
}

// User Social Networks Response
export interface UserSocialNetworksResponse {
    usersocialnetworksetups?: UserSocialNetworkSetup[];
    message?: string;
    [key: string]: any;
}

// Social Network Setup Payload (POST/PUT)
export interface SocialNetworkSetupPayload {
    socialNetworkTypeId: string | number;
    accountName: string;
    username?: string;
    password?: string;
    url?: string;
    [key: string]: any;
}

// Update Social Network Setup Params
export interface UpdateSocialNetworkParams {
    id: number | string;
    data: SocialNetworkSetupPayload;
}

// Social Network Setup Response
export interface SocialNetworkSetupResponse {
    usersocialnetworksetup?: UserSocialNetworkSetup;
    message?: string;
    success?: boolean;
    [key: string]: any;
}

// ==================== Pets API Types ====================

export interface AddPetPayload {
    name: string;
    type: string;
    breed: string;
    birthday: string;
    dateOfAdoption: string;
    sex: string;
    food: string;
    allergies: string;
    isMicrochipped: boolean;
    microchipId: string;
    microchipRegistry: string;
    registrationId: string;
    registrationNumber: string;
    registeredOn: string;
    renewalDate: string;
    issuingAuthority: string;
    photoUrl: string;
}

// Delete Response
export interface DeleteSocialNetworkResponse {
    message?: string;
    success?: boolean;
    deletedId?: number | string;
    [key: string]: any;
}
