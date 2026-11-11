import React, { useCallback, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Feather from 'react-native-vector-icons/Feather';
import colors, { getColorWithOpacity } from '../../../utils/colors';
import { useUserRole } from '../../../hooks/useUserRole';
import { getImageUrl } from '../../../utils/helpers';
import {
  useLocationNameMaps,
  nameFromMap,
  LocationRow,
} from '../../../utils/locationNames';
import { RemoteImage } from '../../../components/common';
import { RootStackParamList } from '../../../types/RootStackParamList.types';
import { ICONS } from '../../../utils/Images';
import { authenticateWithAlert } from '../../../utils/biometricServices';
import { makeEditHistoryDetailStyles } from './EditHistoryDetail.styles';
import { RoleTheme } from '../../../types/roleManager.types';

const { width } = Dimensions.get('window');

type EditHistoryDetailRouteProp = RouteProp<
  RootStackParamList,
  'EditHistoryDetail'
>;
type EditHistoryDetailNavProp = NativeStackNavigationProp<
  RootStackParamList,
  'EditHistoryDetail'
>;

const EditHistoryDetail: React.FC = () => {
  const navigation = useNavigation<EditHistoryDetailNavProp>();
  const route = useRoute<EditHistoryDetailRouteProp>();
  const { historyEntry } = route.params;
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const { themeColors } = useUserRole();
  const styles = useMemo(() => makeEditHistoryDetailStyles(themeColors as RoleTheme), [themeColors]);

  // Username and password are both credential fields: unlocking either one
  // (single biometric prompt) reveals both, so a single flag covers them.
  const [credentialsRevealed, setCredentialsRevealed] = React.useState<boolean>(false);

  const userName =
    historyEntry?.username ||
    historyEntry?.userName ||
    historyEntry?.user?.name ||
    t('edit_history.unknown_user');
  const action = historyEntry?.action || '';

  const EXCLUDED_FIELDS = React.useMemo(
    () =>
      new Set([
        // System / meta IDs
        'Id',
         'UserId',
         'RealEstateId',
         'VehicleId',
          'BusinessId',
           'ParentId',
            'ChildId',
        // Boolean system flags
        'IsDeleted', 'IsDraft', 'IsActive', 'IsMyself',
        // 'AddToWallet',
        //  'Autopay', 
        // 'IsAddedToWallet', 
        'IsAddedinwallet',
        // 'IsAssigned', 'IsAddedtowallet',
        // Location ID references
        'CountryId', 'StateId', 'CityId', 'CategoryId', 'SubCategoryId',
        // Raw enum ID fields (resolved label is shown via TypeLabel / FIELD_NAME_MAP)
        'TypeId', 'SocialNetworkTypeId',
        // Internal int flag
        'ModuleType',
        // Attachment / document / image raw fields
        // 'AttachmentUrl', 
        // 'AttachmentUrls', 'Attachment',
        'AttachmentAfter', 'AttachmentBefore',
        // 'DocumentId', 'Documentid',
        //  'DocumentUrl', 
        'Documenturl',
        'AdditionalAttachments',
        // 'ImageUrl', 'PhotoUrl',
        'PoliceReportUrl', 'CarfaxRecordUrl',
        // SVG / icon raw content fields
        'SocialNetworkTypeIconSvg', 'IconSvg', 'IconUrl', 'SvgIcon', 'SvgContent',
        // Raw dropdown enum value fields (the resolved label comes from dropdowns map / TypeLabel)
        'PassportType',
        'DriverLicenseClass',
        'Type', 'TypeOther',
        'MedicationType', 'MedicationTypeOther',
        'DoseUnit', 'DoseUnitOther',
        'PaymentMethod', 'PaymentMethodOther',
        'Category', 'CategoryOther',
        'UtilityType', 'UtilityTypeOther',
        'VehicleType', 'VehicleTypeOther',
        'ServiceType',
        'InsuranceType', 'InsuranceTypeOther',
        'AccountType',
        'Role', 'RoleOther',
        'ContactType', 'ContactTypeOther',
        'EntityType', 'EntityTypeOther',
        'RegistrationType', 'RegistrationTypeOther',
        // Nested sub-objects rendered separately
        // 'PlannedPayments',
         'Appointments',
          'Medications',
           'Doctors',
            'Caregivers',
        'Warranty', 
        'Insurance', 
        'Loan',
        "LinkedMedicationDetail",
        "ServiceRecords",
        "Accidents",
        "Warranties",
        "Insurances",
        "Loans",
        "CarFaxRecordUrl",
        "Reminders"
      ]),
    [],
  );

  const DROPDOWN_METADATA_SUFFIXES = [
   'TypeBaseUrl', 'BaseName', 'BaseUrl',
    // *Other free-text overrides are already excluded via EXCLUDED_FIELDS above
  ];

  // Entity-type-aware enum maps: entityType → fieldName → { numericValue → label }
  const ENTITY_FIELD_ENUM_MAP: Record<string, Record<string, Record<number, string>>> = {
    Bookmark: {
      Type: { 0: 'URL / Webpage', 1: 'Document' },
    },
  };

  const resolveEnumValue = (entityType: string, fieldName: string, value: any): string | null => {
    const entityMap = ENTITY_FIELD_ENUM_MAP[entityType];
    if (!entityMap) return null;
    const fieldMap = entityMap[fieldName];
    if (!fieldMap) return null;
    const resolved = fieldMap[Number(value)];
    return resolved !== undefined ? resolved : null;
  };


  const buildDropdownMap = (dropdowns: any[] | null): Map<string, string> => {
    const map = new Map<string, string>();
    if (!Array.isArray(dropdowns)) return map;
    dropdowns.forEach((d: any) => {
      if (d?.key && d?.label != null) {
        map.set(d.key, String(d.label));
      }
    });
    return map;
  };

  const oldDropdownMap = React.useMemo(
    () => buildDropdownMap(historyEntry?.olddropdowns),
    [historyEntry?.olddropdowns],
  );
  const newDropdownMap = React.useMemo(
    () => buildDropdownMap(historyEntry?.newdropdowns),
    [historyEntry?.newdropdowns],
  );


  // Country / state are stored as numeric IDs. Resolve them to names using the
  // same global country/state lists the Identity Hub dropdowns are built from.
  const locationRows = React.useMemo<LocationRow[]>(() => {
    const getCI = (obj: any, key: string): any => {
      if (!obj) return undefined;
      if (obj[key] !== undefined) return obj[key];
      const lk = key.toLowerCase();
      const found = Object.keys(obj).find(k => k.toLowerCase() === lk);
      return found ? obj[found] : undefined;
    };
    const rows: LocationRow[] = [];
    [historyEntry?.oldvalues, historyEntry?.newvalues, historyEntry?.entitysnapshot]
      .forEach(src => {
        const country = getCI(src, 'Country');
        const state = getCI(src, 'State');
        if (
          (country !== null && country !== undefined && country !== '') ||
          (state !== null && state !== undefined && state !== '')
        ) {
          rows.push({ country, state });
        }
      });
    return rows;
  }, [historyEntry]);

  const { countryNames, stateNames } = useLocationNameMaps(locationRows);

  const resolveLocationValue = useCallback(
    (fieldName: string, value: any): any => {
      if (value === null || value === undefined || value === '') return value;
      const fl = fieldName.toLowerCase();
      if (fl === 'country') return nameFromMap(countryNames, value);
      if (fl === 'state') return nameFromMap(stateNames, value);
      return value;
    },
    [countryNames, stateNames],
  );

  const getDropdownKey = (fieldName: string): string | null => {
    if (fieldName.endsWith('TypeId')) return fieldName.slice(0, -2);
    if (fieldName.endsWith('Id')) {
      const base = fieldName.slice(0, -2);
      if (oldDropdownMap.has(base) || newDropdownMap.has(base)) return base;
    }
    return null;
  };

  const changes = React.useMemo(() => {
    let rawChanges: any[] = [];

    if (
      Array.isArray(historyEntry?.changes) &&
      historyEntry.changes.length > 0
    ) {
      rawChanges = historyEntry.changes;
    } else {
      const fields: string[] = historyEntry?.changedfields || [];
      const oldVals = historyEntry?.oldvalues || {};
      const newVals = historyEntry?.newvalues || {};
      rawChanges = fields.map((field: string) => ({
        fieldName: field,
        oldValue: oldVals[field] ?? null,
        newValue: newVals[field] ?? null,
      }));
    }

    return rawChanges
      .filter((change: any) => {
        const fieldName = change.fieldName || change.field || '';
        if (EXCLUDED_FIELDS.has(fieldName)) return false;

        // Filter out internal dropdown metadata suffix fields (e.g. SocialNetworkTypeName, SocialNetworkTypeBaseUrl)
        if (DROPDOWN_METADATA_SUFFIXES.some(suffix => fieldName.endsWith(suffix))) return false;

        if (fieldName === 'UploadAttachments') {
          const oldVal = change.oldValue;
          const newVal = change.newValue;
          const isEmpty = (v: any) =>
            v === null || v === undefined || v === '' || v === '[]' || v === '""';
          if (isEmpty(oldVal) && isEmpty(newVal)) return false;
        }

        // Filter out rows where both old and new are effectively empty/dash
        const isMeaninglessEmpty = (v: any) =>
          v === null || v === undefined || v === '' || v === '-' || v === '[]' || v === '""';
        if (isMeaninglessEmpty(change.oldValue) && isMeaninglessEmpty(change.newValue)) return false;

        return true;
      })
      .map((change: any) => {
        const fieldName = change.fieldName || change.field || '';
        const entityType = historyEntry?.entitytype || '';

        // 1. Dropdown resolution (e.g. SocialNetworkTypeId → label)
        const dropdownKey = getDropdownKey(fieldName);
        if (dropdownKey) {
          const resolvedOld = oldDropdownMap.get(dropdownKey) ?? null;
          const resolvedNew = newDropdownMap.get(dropdownKey) ?? null;
          return { ...change, oldValue: resolvedOld, newValue: resolvedNew };
        }

        // 2. Entity-type-aware enum resolution (e.g. Bookmark.Type 0/1)
        if (entityType) {
          const resolvedOld = resolveEnumValue(entityType, fieldName, change.oldValue);
          const resolvedNew = resolveEnumValue(entityType, fieldName, change.newValue);
          if (resolvedOld !== null || resolvedNew !== null) {
            return {
              ...change,
              oldValue: resolvedOld ?? change.oldValue,
              newValue: resolvedNew ?? change.newValue,
            };
          }
        }

        return change;
      });
  }, [historyEntry, EXCLUDED_FIELDS, oldDropdownMap, newDropdownMap, historyEntry?.entitytype]);

  const changeCount = changes.length;
  const dateStr =
    historyEntry?.createdat ||
    historyEntry?.createdAt ||
    historyEntry?.date ||
    '';

  const formatDate = useCallback((ds: string) => {
    try {
      const date = new Date(ds);
      const day = date.getDate();
      const months = [
        'January',
        'February',
        'March',
        'April',
        'May',
        'June',
        'July',
        'August',
        'September',
        'October',
        'November',
        'December',
      ];
      const month = months[date.getMonth()];
      const year = date.getFullYear();
      const hours = date.getHours();
      const minutes = date.getMinutes();
      const ampm = hours >= 12 ? 'PM' : 'AM';
      const displayHours = hours % 12 || 12;
      const displayMinutes = minutes < 10 ? `0${minutes}` : minutes;

      const getOrdinal = (n: number) => {
        const s = ['th', 'st', 'nd', 'rd'];
        const v = n % 100;
        return n + (s[(v - 20) % 10] || s[v] || s[0]);
      };

      return `${getOrdinal(
        day,
      )} ${month} ${year}, ${displayHours}:${displayMinutes} ${ampm}`;
    } catch {
      return ds;
    }
  }, []);

  const isImageField = useCallback((fieldName: string, value: any) => {
    if (!value) return false;
    // Array-valued fields (e.g. PhotoUrl/PhotoUrls holding one or more attachment
    // ids) are always shown as an "N attachments" count, never as a single
    // before/after image comparison — regardless of what the field is named.
    if (Array.isArray(value)) return false;
    const attachmentFields = ['imageurl', 'photourl', 'uploadattachments', 'attachmenturl'];
    if (attachmentFields.includes(fieldName.toLowerCase())) return false;
    const imageKeywords = [
      'image',
      'photo',
      'picture',
      'avatar',
      'thumbnail',
      'imageurl',
      'imageId',
      'uploadattachments',
    ];
    const fieldLower = fieldName.toLowerCase();
    if (imageKeywords.some(kw => fieldLower.includes(kw))) return true;
    if (typeof value === 'string') {
      const lower = value.toLowerCase();
      return (
        lower.endsWith('.jpg') ||
        lower.endsWith('.jpeg') ||
        lower.endsWith('.png') ||
        lower.endsWith('.gif') ||
        lower.endsWith('.webp') ||
        (lower.startsWith('http') &&
          (lower.includes('/image') ||
            lower.includes('.jpg') ||
            lower.includes('.png')))
      );
    }
    return false;
  }, []);

  const FIELD_NAME_MAP: Record<string, string> = {
    // Resolved dropdown label — always shown with a clean name
    TypeLabel: 'Type',
    Typelabel: 'Type',
    CategoryLabel: 'Category',
    Categorylabel: 'Category',
    // Account / social
    AccountName: 'Account Name',
    SocialNetworkTypeId: 'Account Type',
    SocialNetworkUrl: 'Social Network URL',
    Username: 'Username',
    Password: 'Password',
    Url: 'URL',
    URL: 'URL',
    NetworkType: 'Network Type',
    // Personal info
    FirstName: 'First Name',
    LastName: 'Last Name',
    FullName: 'Full Name',
    DateOfBirth: 'Date of Birth',
    PhoneNumber: 'Phone Number',
    EmailAddress: 'Email Address',
    // Subscription
    SubscriptionName: 'Subscription Name',
    BillingFrequency: 'Billing Frequency',
    NextRenewalDate: 'Next Renewal Date',
    PaymentMethodLabel: 'Payment Method',
    // Vehicle
    VehicleMake: 'Vehicle Make',
    VehicleModel: 'Vehicle Model',
    VehicleYear: 'Vehicle Year',
    LicensePlate: 'License Plate',
    ServiceDate: 'Service Date',
    ServiceProvider: 'Service Provider',
    VehicleTypeLabel: 'Vehicle Type',
    RegistrationTypeLabel: 'Registration Type',
    InsuranceTypeLabel: 'Insurance Type',
    // License / certification
    LicenseNumber: 'License Number',
    ExpiryDate: 'Expiry Date',
    IssuingAuthority: 'Issuing Authority',
    IssuedDate: 'Issued Date',
    // Passport
    PassportTypeLabel: 'Passport Type',
    PassportNumber: 'Passport Number',
    IssuingCountry: 'Issuing Country',
    // Driver license
    DriverLicenseClassLabel: 'License Class',
    // Business
    BusinessName: 'Business Name',
    BusinessType: 'Business Type',
    ContactName: 'Contact Name',
    ProjectName: 'Project Name',
    EntityTypeLabel: 'Entity Type',
    RoleLabel: 'Role',
    ContactTypeLabel: 'Contact Type',
    // Personal property
    ModelSerial: 'Model / Serial',
    PurchaseDate: 'Purchase Date',
    DateSoldDiscarded: 'Date Sold / Discarded',
    Price: 'Price',
    // Loan / mortgage
    LenderProvider: 'Lender',
    LenderLocation: 'Lender Location',
    LenderPhoneNumber: 'Lender Phone',
    LenderEmail: 'Lender Email',
    AccountNumber: 'Account Number',
    Balance: 'Balance',
    EstBalance: 'Est. Balance',
    MonthlyPayment: 'Monthly Payment',
    RatePercent: 'Rate %',
    DueDay: 'Due Day',
    BestName: 'Nick Name',
    // Warranty
    WarrantyProvider: 'Warranty Provider',
    Expiration: 'Expiration',
    // Insurance / policy
    InsuranceCarrier: 'Insurance Carrier',
    PolicyNumber: 'Policy Number',
    AnnualPremium: 'Annual Premium',
    AgentEmail: 'Agent Email',
    AgentPhone: 'Agent Phone',
    RenewalDate: 'Renewal Date',
    // Utility
    UtilityTypeLabel: 'Utility Type',
    UtilityName: 'Utility Name',
    Provider: 'Provider',
    // Medication
    MedicationTypeLabel: 'Medication Type',
    DoseUnitLabel: 'Dose Unit',
    Dosage: 'Dosage',
    Frequency: 'Frequency',
    // Real estate
    PropertyName: 'Property Name',
    Address: 'Address',
    // Bank account
    BankName: 'Bank Name',
    RoutingNumber: 'Routing Number',
    // Dates
    StartDate: 'Start Date',
    EndDate: 'End Date',
    // Attachments
    UploadAttachments: 'Attachments',
    ImageUrl: 'Attachments',
    PhotoUrl: 'Attachments',
    AttachmentUrl: 'Attachments',
    PlannedPayments: 'Planned Payments',
    // Bookmark fields
    Sitename: 'Site Name',
    SiteName: 'Site Name',
    UrlLink: 'URL Link',
    Urllink: 'URL Link',
    Note: 'Note',
    Notes: 'Notes',
    Website: 'Website',
    // Business Contact
    CompanyTeam: 'Company / Team',
    Manager: 'Manager',
    Location: 'Location',
    Tags: 'Tags',
    IsPrimary: 'Primary',
    IsReference: 'Reference',
    Status: 'Status',
    // Legal Document
    EffectiveDate: 'Effective Date',
    Effectivedate: 'Effective Date',
    Enddate: 'Expiry Date',
    // Misc
    ItemName: 'Item Name',
    Itemname: 'Item Name',
  };

  const getFieldDisplayName = useCallback((fieldName: string) => {
    if (FIELD_NAME_MAP[fieldName]) return FIELD_NAME_MAP[fieldName];
    return fieldName
      .replace(/([A-Z])/g, ' $1')
      .replace(/_/g, ' ')
      .replace(/^\w/, c => c.toUpperCase())
      .trim();
  }, []);

  const renderImageChange = useCallback(
    (change: any, index: number) => {
      const imageWidth = (width - 80) / 2.2;
      const oldImageUrl =
        typeof change.oldValue === 'string'
          ? getImageUrl(change.oldValue)
          : null;
      const newImageUrl =
        typeof change.newValue === 'string'
          ? getImageUrl(change.newValue)
          : null;

      return (
        <View key={index} style={styles.changeItem}>
          <Text style={styles.fieldLabel}>
            {getFieldDisplayName(change.fieldName || change.field || '')}
          </Text>
          <View style={styles.imageChangeRow}>
            {/* Old Image */}
            <View style={[styles.imageBox, { width: imageWidth }]}>
              {oldImageUrl ? (
                <RemoteImage
                  imageId={change.oldValue}
                  style={[
                    styles.changeImage,
                    { width: imageWidth - 16, height: imageWidth - 16 },
                  ]}
                  resizeMode="cover"
                />
              ) : (
                <View
                  style={[
                    styles.noImageBox,
                    { width: imageWidth - 16, height: imageWidth - 16 },
                  ]}
                >
                  <MaterialIcons
                    name="image-not-supported"
                    size={24}
                    color={colors.gray}
                  />
                </View>
              )}
            </View>

            {/* Arrow */}
            <View style={styles.arrowContainer}>
              <AntDesign name="arrowright" size={18} color={themeColors.primary} />
            </View>

            {/* New Image */}
            <View style={[styles.imageBox, { width: imageWidth }]}>
              {newImageUrl ? (
                <RemoteImage
                  imageId={change.newValue}
                  style={[
                    styles.changeImage,
                    { width: imageWidth - 16, height: imageWidth - 16 },
                  ]}
                  resizeMode="cover"
                />
              ) : (
                <View
                  style={[
                    styles.noImageBox,
                    { width: imageWidth - 16, height: imageWidth - 16 },
                  ]}
                >
                  <MaterialIcons
                    name="image-not-supported"
                    size={24}
                    color={colors.gray}
                  />
                </View>
              )}
            </View>
          </View>
        </View>
      );
    },
    [getFieldDisplayName],
  );

  const formatFieldValue = useCallback((value: any): string => {
    if (value == null) return '-';

    if (Array.isArray(value)) {
      if (value.length === 0) return '-';
      return `${value.length} attachment${value.length !== 1 ? 's' : ''}`;
    }

    if (typeof value === 'object') {
      try {
        return JSON.stringify(value);
      } catch {
        return '-';
      }
    }

    const str = String(value);
    if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(str)) {
      try {
        const date = new Date(str);
        if (!isNaN(date.getTime())) {
          const mm = String(date.getMonth() + 1).padStart(2, '0');
          const dd = String(date.getDate()).padStart(2, '0');
          const yyyy = date.getFullYear();
          return `${mm}/${dd}/${yyyy}`;
        }
      } catch {
        /* fall through */
      }
    }
    return str;
  }, []);

  const renderTextChange = useCallback(
    (change: any, index: number) => {
      const fieldName = change.fieldName || change.field || '';

      // Username & password are both credential fields — locked behind a
      // single biometric prompt; unlocking either one reveals both.
      const isPasswordField = fieldName.toLowerCase() === 'password';
      const isUsernameField = fieldName.toLowerCase() === 'username';
      const isCredentialField = isPasswordField || isUsernameField;
      const isRevealed = credentialsRevealed;

      const handleRevealCredentials = async () => {
        await authenticateWithAlert({
          promptMessage: t('social_media.authenticateToView') || 'Authenticate to view credentials',
          cancelButtonText: t('common.cancel') || 'Cancel',
          failureTitle: t('social_media.authenticationFailed') || 'Authentication Failed',
          failureMessage: t('social_media.authenticationRequiredToViewAccount') || 'Authentication is required to view credentials',
          okButtonText: t('common.ok') || 'OK',
          allowDeviceCredentials: true,
          onSuccess: () => {
            setCredentialsRevealed(true);
          },
        });
      };

      const formatValueForField = (value: any): string => {
        if (fieldName === 'Reminders' && Array.isArray(value)) {
          if (value.length === 0) return '-';

          const summaries = value.map((reminder: any) => {
            const title = reminder.title || t('edit_history.reminder');
            const date = reminder.reminderDate || reminder.reminderdate;
            if (date) {
              return `${title} - ${formatFieldValue(date)}`;
            }
            return title;
          });

          return summaries.join(', ');
        }

        if (fieldName === 'PlannedPayments' && Array.isArray(value)) {
          if (value.length === 0) return '-';
          return value.map((p: any, i: number) => {
            const date = p.dueDate || p.duedate || '';
            const amount = p.amount != null ? `$${p.amount}` : '';
            const desc = p.description || '';
            const parts = [date ? formatFieldValue(date) : '', amount, desc].filter(Boolean);
            return `${i + 1}. ${parts.join(' - ')}`;
          }).join('\n');
        }

        // Generic array handling (e.g. DocumentId)
        if (Array.isArray(value)) {
          if (value.length === 0) return '-';
          return `${value.length} attachment${value.length !== 1 ? 's' : ''}`;
        }

        return formatFieldValue(value);
      };

      const isEmpty = (v: any) =>
        v === null ||
        v === undefined ||
        v === '' ||
        v === '-' ||
        v === '[]' ||
        v === '""';

      const rawOld = resolveLocationValue(fieldName, change.oldValue);
      const rawNew = resolveLocationValue(fieldName, change.newValue);
      const oldVal = formatValueForField(rawOld);
      const newVal = formatValueForField(rawNew);

      const newIsEmpty = isEmpty(rawNew) || newVal === '-';
      const oldIsEmpty = isEmpty(rawOld) || oldVal === '-';

      // Old side: if previously empty, show "Not set"
      const displayOldVal = oldIsEmpty ? t('edit_history.not_set') || 'Not set' : oldVal;
      const oldWasNotSet = oldIsEmpty;

      // New side: if emptied/removed, show "Removed"
      let displayNewVal = newIsEmpty ? t('edit_history.removed') || 'Removed' : newVal;
      let newIsRemoved = newIsEmpty;

      const maxLines = (fieldName === 'Reminders' || fieldName === 'PlannedPayments') ? undefined : 2;

      return (
        <View key={index} style={styles.changeItem}>
          <Text style={styles.fieldLabel}>
            {getFieldDisplayName(fieldName)}
          </Text>

          {isCredentialField && !isRevealed ? (
            // Locked username/password row — tap to authenticate
            <TouchableOpacity
              style={styles.passwordLockedRow}
              onPress={handleRevealCredentials}
              activeOpacity={0.7}
            >
              <View style={styles.valueBox}>
                <Text style={styles.maskedText}>••••••••</Text>
              </View>
              <View style={styles.arrowContainer}>
                <AntDesign name="arrowright" size={18} color={themeColors.primary} />
              </View>
              <View style={[styles.valueBox, styles.newValueBox]}>
                <Text style={[styles.maskedText, { color: themeColors.primary }]}>••••••••</Text>
              </View>
              <View style={styles.lockIconContainer}>
                <Feather name="lock" size={16} color={themeColors.primary} />
              </View>
            </TouchableOpacity>
          ) : (
            <View style={styles.textChangeRow}>
              {/* Old Value */}
              <View style={styles.valueBox}>
                <Text
                  style={[
                    styles.oldValueText,
                    oldWasNotSet && styles.notSetValueText,
                  ]}
                  numberOfLines={maxLines}
                >
                  {displayOldVal}
                </Text>
              </View>

              {/* Arrow */}
              <View style={styles.arrowContainer}>
                <AntDesign name="arrowright" size={18} color={themeColors.primary} />
              </View>

              {/* New Value */}
              <View style={[styles.valueBox, styles.newValueBox]}>
                <Text
                  style={[
                    styles.newValueText,
                    { color: themeColors.primary },
                    newIsRemoved && styles.removedValueText,
                  ]}
                  numberOfLines={maxLines}
                >
                  {displayNewVal}
                </Text>
              </View>

              {/* Unlock icon for revealed username/password */}
              {isCredentialField && isRevealed && (
                <View style={styles.lockIconContainer}>
                  <Feather name="unlock" size={16} color={themeColors.primary} />
                </View>
              )}
            </View>
          )}
        </View>
      );
    },
    [formatFieldValue, getFieldDisplayName, t, credentialsRevealed, themeColors, resolveLocationValue],
  );

  return (
    <View style={styles.gradient}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Image
              source={ICONS.BACK_ICON}
              style={[{ width: 35, height: 35, tintColor: themeColors.textPrimary }]}
              resizeMode="contain"
            />
          </TouchableOpacity>
          <View style={styles.headerTextContainer}>
            <View style={styles.headerNameRow}>
              <Text style={styles.headerTitle}>{userName}</Text>
              <View
                style={[
                  styles.changeBadge,
                  { backgroundColor: getColorWithOpacity(themeColors.primary, 0.5) },
                ]}
              >
                <Text
                  style={[
                    styles.changeBadgeText,
                    { color: themeColors.secondary },
                  ]}
                >
                  {changeCount}{' '}
                  {changeCount === 1
                    ? t('edit_history.change')
                    : t('edit_history.changes')}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Changes List */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.headerSubtitle}>{formatDate(dateStr)}</Text>
          {changes.map((change: any, index: number) => {
            const fieldName = change.fieldName || change.field || '';
            const isImage =
              isImageField(fieldName, change.oldValue) ||
              isImageField(fieldName, change.newValue);

            if (isImage) {
              return renderImageChange(change, index);
            }
            return renderTextChange(change, index);
          })}

          {changes.length === 0 && (
            <View style={styles.emptyContainer}>
              <MaterialIcons
                name="info-outline"
                size={48}
                color={colors.lightGray}
              />
              <Text style={styles.emptyText}>
                {t('edit_history.no_changes')}
              </Text>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};


export default EditHistoryDetail;
