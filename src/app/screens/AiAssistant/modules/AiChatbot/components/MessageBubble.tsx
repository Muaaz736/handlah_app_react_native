import React, { FC, memo, useRef, useEffect, useState, useMemo } from 'react';
import {
  View,
  Animated,
  Text,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { IChatMessage } from '../AiChatbot.types';
import type { ChatUIAction } from '../../../AiAssistant.types';
import colors from '../../../../../../utils/colors';
import Markdown from 'react-native-markdown-display';
import { ICONS } from '../../../../../../utils/Images';
import Ionicons from 'react-native-vector-icons/Ionicons';
import FontAwesome6 from 'react-native-vector-icons/FontAwesome6';
import { useUserRole } from '../../../../../../hooks/useUserRole';
import {
  makeMessageBubbleStyles,
  makeRichStyles,
  makeListStyles,
  makeSubSectionStyles,
  makePickerStyles,
  makeMediaUploadStyles,
} from './MessageBubble.styles';
import { RoleTheme } from '../../../../../../types/roleManager.types';
import { isLabelCompanionOf } from '../chatPayloadResolver';

const ASSETS_LIST = ['List Properties', 'List Vehicles', 'List Real Estates', 'List Bank Accounts'];
const LIABILITIES_LIST = ['List Loans', 'List Utilities', 'List Insurance', 'List Warranties'];
const ESSENTIALS_LIST = [
  'List Appointments', 'List Medications', 'List Doctors', 'List Caregivers',
  'List Passports', "List Driver's Licenses", 'List Certifications',
  'List Social Media Accounts', 'List Bookmarks', 'List Wallet',
  'List Pets', 'List Subscriptions', 'List Documents',
];

const getChipsForIntent = (intent?: string): string[] | null => {
  if (intent === 'assets') return ASSETS_LIST;
  if (intent === 'liabilities_and_expenses') return LIABILITIES_LIST;
  if (intent === 'essentials') return ESSENTIALS_LIST;
  return null;
};

interface IMessageBubbleProps {
  message: IChatMessage;
  themeColor: string;
  actionLoading?: string | null;
  onConfirm?: (uiAction: ChatUIAction, msgId: string) => void;
  onCancel?: (msgId: string) => void;
  onPickerSelect?: (pickerField: string, pickerValue: any, msgId: string) => void;
  onSpeak?: (text: string, id: string) => void;
  speakingId?: string | null;
  onChipPress?: (text: string) => void;
  onMediaAction?: (event: 'media_done' | 'media_skipped' | 'tool_cancelled', msgId: string) => void;
  onAttachPress?: () => void;
  onMediaUpload?: (msgId: string) => void;
}

const SYSTEM_FIELDS = new Set([
  'id', 'userid', 'createdat', 'updatedat', 'isactive', 'ismyself',
  'realestateid', 'vehicleid', 'businessid', 'parentid',
  'addtowallet', 'autopay', 'isdraft', 'isaddedinwallet',
  'isassigned', 'isaddedtowallet',
  'countryid', 'stateid', 'cityid', 'categoryid', 'subcategoryid',
  'attachmenturl', 'attachmenturls', 'attachment', 'attachmentafter', 'attachmentbefore',
  'documentid', 'documenturl', 'additionalattachments',
  'imageurl', 'photourl', 'uploadattachments',
  'policereporturl', 'carfaxrecordurl',
  'typeid', 'socialnetworktypeid',
  'moduletype', 'batchid', 'entityid', 'senderuserid',
  'receiveruserid', 'connectiontypeid', 'senderbusinessids',
  'sendersocialnetworkids', 'receiverbusinessids', 'receiversocialnetworkids'
]);


const ENUM_FIELDS = new Set([
  'passporttype',
  'driverlicenseclass',
  'type', 'typeother',
  'medicationtype', 'medicationtypeother',
  'doseunit', 'doseunitother',
  'paymentmethod', 'paymentmethodother',
  'category', 'categoryother',
  'utilitytype', 'utilitytypeother',
  'vehicletype', 'vehicletypeother',
  'servicetype',
  'insurancetype', 'insurancetypeother',
  'role', 'roleother',
  'contacttype', 'contacttypeother',
  'entitytype', 'entitytypeother',
  'registrationtype', 'registrationtypeother',
  'accounttype', 'status',
]);
const OBJECT_ARRAY_FIELDS = new Set([
  'appointments', 'medications', 'doctors', 'caregivers', 'plannedpayments',
  'warranty', 'insurance', 'loan',
]);

const FRIENDLY_KEYS: Record<string, string> = {
  typelabel:        'Type',
  vehicletypelabel: 'Type',
  typelabellabel:   'Type',
  categorylabel:    'Category',
  modelserial:      'Model / Serial',
  purchasedate:     'Purchase Date',
  datesolddiscarded:'Date Sold / Discarded',
  annualpremium:    'Annual Premium',
  renewaldate:      'Renewal Date',
  lenderprovider:   'Lender',
  lenderlocation:   'Lender Location',
  lenderphonenumber:'Lender Phone',
  lenderemail:      'Lender Email',
  accountnumber:    'Account Number',
  monthlypayment:   'Monthly Payment',
  ratepercent:      'Rate %',
  estbalance:       'Est. Balance',
  dueday:           'Due Day',
  startdate:        'Start Date',
  enddate:          'End Date',
  expiration:       'Expiration',
  warrantyprovider: 'Warranty Provider',
  insurancecarrier: 'Insurance Carrier',
  policynumber:     'Policy Number',
  agentemail:       'Agent Email',
  agentphone:       'Agent Phone',
  itemname:         'Item Name',
  bestname:         'Nick Name',
  website:          'Website',
  notes:            'Notes',
};

const isDateString = (val: string) => /^\d{4}-\d{2}-\d{2}T/.test(val);

const prettifyKey = (key: string): string => {
  const friendly = FRIENDLY_KEYS[key.toLowerCase()];
  if (friendly) return friendly;
  return key
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')
    .replace(/([_-])/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase())
    .trim();
};

const formatFieldValue = (key: string, value: any): string => {
  if (value === null || value === undefined) return 'N/A';
  if (value === '') return 'N/A';

  if (typeof value === 'boolean') return value ? 'Yes' : 'No';

  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) return 'N/A';
    if (isDateString(trimmed)) {
      if (trimmed.startsWith('0001-')) return 'N/A';
      try {
        const d = new Date(trimmed);
        return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
      } catch { return trimmed; }
    }
    return trimmed;
  }

  if (typeof value === 'number') {
    if (!isFinite(value)) return 'N/A';
    const lk = key.toLowerCase();
    const moneyKeys = ['balance', 'amount', 'premium', 'payment', 'price', 'value', 'mindue', 'apr'];
    if (moneyKeys.some(k => lk.includes(k))) {
      try {
        return `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
      } catch {
        return `$${value}`;
      }
    }
    return String(value);
  }

  if (Array.isArray(value)) {
    if (value.length === 0) return 'None';
    const nonNull = value.filter(v => v !== null && v !== undefined);
    if (nonNull.length === 0) return 'None';
    if (typeof nonNull[0] !== 'object') {
      return nonNull.map(v => String(v)).join(', ');
    }
    return `${value.length} item${value.length !== 1 ? 's' : ''}`;
  }

  if (typeof value === 'object') {
    try {
      const nameFields = [
        'countryname', 'statename', 'cityname', 'provincename', 'regionname',
        'name', 'title', 'label', 'displayname', 'fullname',
      ];
      for (const field of nameFields) {
        const candidate = value[field];
        if (candidate !== null && candidate !== undefined && candidate !== '') {
          return String(candidate);
        }
      }
      const json = JSON.stringify(value);
      return json === '{}' ? 'N/A' : json;
    } catch {
      return 'N/A';
    }
  }

  try {
    return String(value);
  } catch {
    return 'N/A';
  }
};

const isRedundantLabelCompanion = (key: string, item: Record<string, any>): boolean =>
  Object.keys(item).some(
    baseKey => baseKey.toLowerCase() !== key.toLowerCase() && isLabelCompanionOf(key, baseKey),
  );

const getDisplayFields = (
  item: Record<string, any>,
  primaryKey: string,
  hasResolvedDisplay = false,
): [string, any][] =>
  Object.entries(item).filter(([key, value]) => {
    const lKey = key.toLowerCase();
    if (SYSTEM_FIELDS.has(lKey) || OBJECT_ARRAY_FIELDS.has(lKey)) return false;
    if (!hasResolvedDisplay && ENUM_FIELDS.has(lKey)) return false;
    if (hasResolvedDisplay && isRedundantLabelCompanion(key, item)) return false;
    const lPrimary = primaryKey.toLowerCase();
    if (lKey === lPrimary || lKey === 'name' || lKey === 'title' || lKey === 'label') return false;
    if (Array.isArray(value) && value.length === 0) return false;
    if (value === null || value === undefined || value === '') return false;
    if (typeof value === 'object' && !Array.isArray(value)) return false;
    return true;
  });

const SUB_SYSTEM_FIELDS = new Set([
  'id', 'userid', 'createdat', 'updatedat', 'isactive', 'isdraft',
  'realestateid', 'vehicleid', 'businessid', 'parentid',
  'uploadattachments', 'attachmenturl', 'attachmenturls', 'attachment',
  'imageurl', 'photourl',
]);

const getSubFields = (obj: Record<string, any>): [string, any][] =>
  Object.entries(obj).filter(([key, value]) => {
    const lKey = key.toLowerCase();
    if (SUB_SYSTEM_FIELDS.has(lKey)) return false;
    if (value === null || value === undefined || value === '') return false;
    if (typeof value === 'object') return false;
    return true;
  });

const PropertySubSection: FC<{ label: string; data: Record<string, any> | null | undefined }> = ({ label, data }) => {
  const { themeColors } = useUserRole();
  const subSectionStyles = useMemo(() => makeSubSectionStyles(themeColors as RoleTheme), [themeColors]);
  if (!data || typeof data !== 'object') return null;
  const fields = getSubFields(data);
  if (fields.length === 0) return null;
  return (
    <View style={subSectionStyles.wrapper}>
      <Text style={subSectionStyles.header}>{label}</Text>
      {fields.map(([key, value], i) => (
        <View
          key={key}
          style={[
            subSectionStyles.row,
            i === fields.length - 1 && subSectionStyles.rowLast,
          ]}
        >
          <Text style={subSectionStyles.label}>{prettifyKey(key)}</Text>
          <Text style={subSectionStyles.value}>{formatFieldValue(key, value)}</Text>
        </View>
      ))}
    </View>
  );
};

const getPrimaryKey = (item: Record<string, any>) =>
  ['name', 'nickname', 'title', 'label', 'vendor', 'accountname', 'itemname', 'bestname', 'streetaddress'].find(
    k => item[k] != null && item[k] !== '',
  ) || 'name';

const fullNameOf = (person: Record<string, any> | null | undefined): string =>
  [person?.firstname, person?.lastname].filter(Boolean).join(' ').trim();

const getConnectionTitle = (item: Record<string, any>): string | null => {
  const sender = fullNameOf(item.senderuser);
  const receiver = fullNameOf(item.receiveruser);
  if (sender && receiver) return `${sender} ↔ ${receiver}`;
  return sender || receiver || null;
};

interface ReviewCardProps {
  uiAction: ChatUIAction;
  msgId: string;
  isActioned: boolean;
  themeColor: string;
  actionLoading?: string | null;
  onConfirm?: (uiAction: ChatUIAction, msgId: string) => void;
  onCancel?: (msgId: string) => void;
  status?: 'complete' | 'cancelled' | string;
}

const ReviewCard: FC<ReviewCardProps> = memo(
  ({ uiAction, msgId, isActioned, themeColor, actionLoading, onConfirm, onCancel ,status}) => {
    const { themeColors } = useUserRole();
    const richStyles = useMemo(() => makeRichStyles(themeColors as RoleTheme), [themeColors]);
    const payload = uiAction.displayPayload || uiAction.payload || {};
    const isThisLoading = actionLoading === msgId;
    const actionsObj = Array.isArray(uiAction.actions) ? undefined : uiAction.actions;

    const hasResolvedDisplay = !!uiAction.displayPayload;
    const displayFields = Object.entries(payload).filter(
      ([key, value]) => {
        const lKey = key.toLowerCase();
        return (
          value !== null &&
          value !== '' &&
          !SYSTEM_FIELDS.has(lKey) &&
          (hasResolvedDisplay || !ENUM_FIELDS.has(lKey)) &&
          !(hasResolvedDisplay && isRedundantLabelCompanion(key, payload)) &&
          !uiAction.system_fields?.includes(key)
        );
      },
    );

    return (
      <View style={richStyles.card}>
        <View style={richStyles.reviewHeader}>
          <Text style={richStyles.reviewTitle}>
            ✦{'  '}
            <Text style={richStyles.reviewTitleBold}>{uiAction.label || 'Review'}</Text>
          </Text>
          {uiAction.step != null && uiAction.total_steps != null && (
            <Text style={richStyles.stepText}>
              Step {uiAction.step}/{uiAction.total_steps}
            </Text>
          )}
        </View>

        {displayFields.map(([key, value], i) => (
          <View
            key={key}
            style={[
              richStyles.fieldRow,
              i === displayFields.length - 1 && isActioned && richStyles.fieldRowLast,
            ]}
          >
            <Text style={richStyles.fieldLabel}>{prettifyKey(key)}</Text>
            <Text style={richStyles.fieldValue}>{formatFieldValue(key, value)}</Text>
          </View>
        ))}

        {status !== 'complete' && status !== 'cancelled' && (
          <View style={richStyles.reviewActions}>
            <TouchableOpacity
              style={[richStyles.actionBtn, richStyles.cancelBtn]}
              onPress={() => onCancel?.(msgId)}
              disabled={isThisLoading}
              activeOpacity={0.7}
            >
              <Text style={richStyles.cancelBtnText}>
                {actionsObj?.cancel?.label || 'Cancel'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[richStyles.actionBtn, richStyles.confirmBtn, { backgroundColor: themeColor }]}
              onPress={() => onConfirm?.(uiAction, msgId)}
              disabled={isThisLoading}
              activeOpacity={0.8}
            >
              {isThisLoading ? (
                <ActivityIndicator size="small" color={colors.white} />
              ) : (
                <Text style={richStyles.confirmBtnText}>
                  {actionsObj?.confirm?.label || 'Save'}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        {status === 'complete' || status === 'cancelled' ? (
          <View style={richStyles.actionedBadge}>
            <Text style={richStyles.actionedText}>{status === 'complete' ? '✓ Completed' : '✗ Cancelled'}</Text>
          </View>
        ) : null}
        
      </View>
    );
  },
);
ReviewCard.displayName = 'ReviewCard';

const ListItem: FC<{ item: Record<string, any>; idx: number; themeColor: string; entity?: string; hasResolvedDisplay?: boolean }> = memo(
  ({ item, idx, themeColor, entity, hasResolvedDisplay }) => {
    const { themeColors } = useUserRole();
    const listStyles = useMemo(() => makeListStyles(themeColors as RoleTheme), [themeColors]);
    const [expanded, setExpanded] = useState(false);
    const primaryKey = getPrimaryKey(item);
    const entitySingular = entity
      ? entity.replace(/s$/, '')
      : 'Item';
    const entityLabel = entitySingular.charAt(0).toUpperCase() + entitySingular.slice(1);
    const connectionTitle = entitySingular.toLowerCase() === 'connection' ? getConnectionTitle(item) : null;
    const name = connectionTitle || item[primaryKey] || `${entityLabel} ${idx + 1}`;
    const displayFields = getDisplayFields(item, primaryKey, hasResolvedDisplay);
    const previewFields = displayFields.slice(0, 2);

    return (
      <View style={listStyles.item}>
        <TouchableOpacity
          style={listStyles.row}
          onPress={() => setExpanded(e => !e)}
          activeOpacity={0.7}
        >
          <View style={[listStyles.avatar, { backgroundColor: themeColor }]}>
            <Text style={listStyles.avatarText}>{String(name).charAt(0).toUpperCase()}</Text>
          </View>
          <View style={listStyles.info}>
            <Text style={listStyles.name}>{String(name)}</Text>
            {previewFields.length > 0 && (
              <Text style={listStyles.sub} numberOfLines={1}>
                {previewFields.map(([k, v]) => `${prettifyKey(k)}: ${formatFieldValue(k, v)}`).join('  ·  ')}
              </Text>
            )}
          </View>
          <Ionicons
            name={expanded ? 'chevron-up' : 'chevron-down'}
            size={16}
            color={colors.gray}
          />
        </TouchableOpacity>

        {expanded && (
          <View style={listStyles.expandedPanel}>
            {displayFields.map(([key, value], fi) => (
              <View
                key={key}
                style={[
                  listStyles.expandedRow,
                  fi === displayFields.length - 1 && !item.warranty && !item.insurance && !item.loan && listStyles.expandedRowLast,
                ]}
              >
                <Text style={listStyles.expandedLabel}>{prettifyKey(key)}</Text>
                <Text style={listStyles.expandedValue}>{formatFieldValue(key, value)}</Text>
              </View>
            ))}
            {/* Personal property nested sub-sections */}
            <PropertySubSection label="Warranty" data={item.warranty} />
            <PropertySubSection label="Insurance" data={item.insurance} />
            <PropertySubSection label="Loan" data={item.loan} />
          </View>
        )}
      </View>
    );
  },
);
ListItem.displayName = 'ListItem';

const ListCard: FC<{ uiAction: ChatUIAction; themeColor: string }> = memo(
  ({ uiAction, themeColor }) => {
    const { themeColors } = useUserRole();
    const richStyles = useMemo(() => makeRichStyles(themeColors as RoleTheme), [themeColors]);
    const hasResolvedDisplay = !!uiAction.displayItems;
    const items = uiAction.displayItems || uiAction.items || [];
    const entity = uiAction.entity || 'item';
    const entityLabel = entity.charAt(0).toUpperCase() + entity.slice(1);

    return (
      <View style={richStyles.card}>
        <Text style={richStyles.reviewTitle}>
          ✦{'  '}
          <Text style={richStyles.reviewTitleBold}>{`${entityLabel}`}</Text>
        </Text>
        {items.length === 0 ? (
          <Text style={richStyles.emptyText}>No {entityLabel} found.</Text>
        ) : (
          items.map((item, idx) => (
            <ListItem
              key={item.id ?? idx}
              item={item}
              idx={idx}
              themeColor={themeColor}
              entity={entity}
              hasResolvedDisplay={hasResolvedDisplay}
            />
          ))
        )}
        <Text style={richStyles.count}>
          {items.length} record{items.length !== 1 ? 's' : ''}
        </Text>
      </View>
    );
  },
);
ListCard.displayName = 'ListCard';

interface PickerCardProps {
  uiAction: ChatUIAction;
  msgId: string;
  themeColor: string;
  actionLoading?: string | null;
  onPickerSelect?: (pickerField: string, pickerValue: any, msgId: string) => void;
  onCancel?: (msgId: string) => void;
  status?: string;
}

const PickerCard: FC<PickerCardProps> = memo(
  ({ uiAction, msgId, themeColor, actionLoading, onPickerSelect, onCancel, status }) => {
    const { themeColors } = useUserRole();
    const richStyles = useMemo(() => makeRichStyles(themeColors as RoleTheme), [themeColors]);
    const pickerStyles = useMemo(() => makePickerStyles(themeColors as RoleTheme), [themeColors]);
    const items = uiAction.items || [];
    const isCardLoading = actionLoading === msgId;
    const [loadingValue, setLoadingValue] = useState<any>(null);
    const isActioned = status === 'complete' || status === 'cancelled';
    const actionsObj = Array.isArray(uiAction.actions) ? undefined : uiAction.actions;
    const pickerField = uiAction.picker_field || 'id';

    // Clear per-item loading when the card-level loading resolves
    useEffect(() => {
      if (!isCardLoading) setLoadingValue(null);
    }, [isCardLoading]);

    return (
      <View style={richStyles.card}>
        <View style={richStyles.reviewHeader}>
          <Text style={richStyles.reviewTitle}>
            ✦{'  '}
            <Text style={richStyles.reviewTitleBold}>{uiAction.picker_label || 'Select an option'}</Text>
          </Text>
        </View>

        {isActioned ? (
          <View style={richStyles.actionedBadge}>
            <Text style={richStyles.actionedText}>
              {status === 'cancelled' ? '✗ Cancelled' : '✓ Selected'}
            </Text>
          </View>
        ) : (
          <>
            {items.length === 0 ? (
              <Text style={richStyles.emptyText}>No options available.</Text>
            ) : (
              items.map((item, idx) => {
                const label =
                  item.name || item.label || item.title || item.description || String(item[pickerField] ?? `Option ${idx + 1}`);
                const secondary = item.secondary || '';
                // Picker items don't always carry a key matching `pickerField` (e.g. a
                // "state" picker's options come back as { id, description }, not
                // { state }), so fall back to the common id/value keys before giving up.
                const itemValue = item[pickerField] ?? item.id ?? item.value ?? item.code;
                const isThisItemLoading = isCardLoading && loadingValue === itemValue;
                return (
                  <TouchableOpacity
                    key={itemValue ?? idx}
                    style={[pickerStyles.item, idx === items.length - 1 && pickerStyles.itemLast]}
                    onPress={() => {
                      if (isCardLoading) return;
                      setLoadingValue(itemValue);
                      onPickerSelect?.(pickerField, itemValue, msgId);
                    }}
                    disabled={isCardLoading}
                    activeOpacity={0.7}
                  >
                    <View style={[pickerStyles.avatar, { backgroundColor: themeColor }]}>
                      <Text style={pickerStyles.avatarText}>{String(label).charAt(0).toUpperCase()}</Text>
                    </View>
                    <View style={pickerStyles.info}>
                      <Text style={pickerStyles.name}>{label}</Text>
                      {!!secondary && <Text style={pickerStyles.secondary}>{secondary}</Text>}
                    </View>
                    {isThisItemLoading ? (
                      <ActivityIndicator size="small" color={themeColor} />
                    ) : (
                      <Ionicons name="chevron-forward" size={16} color={isCardLoading ? colors.border || '#E0E0E0' : colors.gray} />
                    )}
                  </TouchableOpacity>
                );
              })
            )}
            {actionsObj?.cancel && (
              <TouchableOpacity
                style={[richStyles.actionBtn, richStyles.cancelBtn, { marginTop: 12 }]}
                onPress={() => onCancel?.(msgId)}
                disabled={isCardLoading}
                activeOpacity={0.7}
              >
                <Text style={richStyles.cancelBtnText}>{actionsObj.cancel.label || 'Cancel'}</Text>
              </TouchableOpacity>
            )}
          </>
        )}
      </View>
    );
  },
);
PickerCard.displayName = 'PickerCard';

interface MediaUploadCardProps {
  uiAction: ChatUIAction;
  msgId: string;
  themeColor: string;
  actionLoading?: string | null;
  onMediaAction?: (event: 'media_done' | 'media_skipped' | 'tool_cancelled', msgId: string) => void;
  onAttachPress?: () => void;
  onMediaUpload?: (msgId: string) => void;
  status?: string;
}

const MediaUploadCard: FC<MediaUploadCardProps> = memo(
  ({ uiAction, msgId, themeColor, actionLoading, onMediaAction, onAttachPress, onMediaUpload, status }) => {
    const { themeColors } = useUserRole();
    const muStyles = useMemo(() => makeMediaUploadStyles(themeColors as RoleTheme), [themeColors]);
    const isActioned = status === 'complete' || status === 'cancelled';
    const loading = actionLoading === msgId;
    const collectedCount = uiAction.collected_ids?.length ?? 0;
    const initialCountRef = useRef(collectedCount);
    const hasNewUpload = collectedCount > initialCountRef.current;
    const [activeAction, setActiveAction] = useState<'done' | 'skip' | 'cancel' | null>(null);
    const doneAction = typeof uiAction.actions === 'object' && !Array.isArray(uiAction.actions)
      ? uiAction.actions?.done
      : undefined;
    const skipAction = typeof uiAction.actions === 'object' && !Array.isArray(uiAction.actions)
      ? uiAction.actions?.skip
      : undefined;
    const cancelAction = typeof uiAction.actions === 'object' && !Array.isArray(uiAction.actions)
      ? uiAction.actions?.cancel
      : undefined;

    useEffect(() => {
      if (!loading) setActiveAction(null);
    }, [loading]);

    const doneDisabled = loading || !hasNewUpload;

    const handleDonePress = () => {
      setActiveAction('done');
      onMediaAction?.('media_done', msgId);
    };

    return (
      <View style={muStyles.container}>
        {!!uiAction.description && (
          <Text style={muStyles.description}>{uiAction.description}</Text>
        )}
        {collectedCount > 0 && (
          <View style={muStyles.collectedRow}>
            <Text style={muStyles.collectedCount}>{collectedCount} file{collectedCount !== 1 ? 's' : ''} added</Text>
          </View>
        )}
        {!isActioned && (
          <TouchableOpacity
            style={[muStyles.attachBtn, { borderColor: themeColor }]}
            onPress={() => onMediaUpload?.(msgId)}
            activeOpacity={0.7}
            disabled={loading}
          >
            <Ionicons name="attach" size={18} color={themeColor} />
            <Text style={[muStyles.attachBtnText, { color: themeColor }]}>Add File</Text>
          </TouchableOpacity>
        )}
        {isActioned ? (
          <View style={muStyles.actionedBadge}>
            <Text style={muStyles.actionedText}>{status === 'cancelled' ? 'Cancelled' : 'Done'}</Text>
          </View>
        ) : (
          <View style={muStyles.actionsRow}>
            {doneAction && (
              <TouchableOpacity
                style={[muStyles.actionBtn, muStyles.doneBtn, { backgroundColor: themeColor, opacity: doneDisabled ? 0.4 : 1 }]}
                onPress={handleDonePress}
                disabled={doneDisabled}
                activeOpacity={0.7}
              >
                {loading && activeAction === 'done' ? <ActivityIndicator size="small" color="#fff" /> : <Text style={muStyles.doneBtnText}>{doneAction.label}</Text>}
              </TouchableOpacity>
            )}
            {skipAction && (
              <TouchableOpacity
                style={[muStyles.actionBtn, muStyles.skipBtn, { borderColor: themeColor }]}
                onPress={() => { setActiveAction('skip'); onMediaAction?.('media_skipped', msgId); }}
                disabled={loading}
                activeOpacity={0.7}
              >
                {loading && activeAction === 'skip' ? <ActivityIndicator size="small" color={themeColor} /> : <Text style={[muStyles.skipBtnText, { color: themeColor }]}>{skipAction.label}</Text>}
              </TouchableOpacity>
            )}
            {cancelAction && (
              <TouchableOpacity
                style={[muStyles.actionBtn, muStyles.cancelBtn]}
                onPress={() => { setActiveAction('cancel'); onMediaAction?.('tool_cancelled', msgId); }}
                disabled={loading}
                activeOpacity={0.7}
              >
                {loading && activeAction === 'cancel' ? <ActivityIndicator size="small" color="#DC2626" /> : <Text style={muStyles.cancelBtnText}>{cancelAction.label}</Text>}
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    );
  },
);
MediaUploadCard.displayName = 'MediaUploadCard';

const MessageBubble: FC<IMessageBubbleProps> = memo(
  ({ message, themeColor, actionLoading, onConfirm, onCancel, onPickerSelect, onSpeak, speakingId, onChipPress, onMediaAction, onAttachPress, onMediaUpload }) => {
    const { themeColors } = useUserRole();
    const styles = useMemo(() => makeMessageBubbleStyles(themeColors as RoleTheme), [themeColors]);
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(
      new Animated.Value(message.isUser ? 20 : -20),
    ).current;

    useEffect(() => {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 280,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 80,
          friction: 10,
          useNativeDriver: true,
        }),
      ]).start();
    }, [fadeAnim, slideAnim]);

    const formatTime = (date: Date) =>
      date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const uiAction = message.aiResponse?.ui_action;
    const isReview = !message.isUser && uiAction?.type === 'review';
    const isList = !message.isUser && uiAction?.type === 'list';
    const isPicker = !message.isUser && uiAction?.type === 'picker';
    const isMediaUpload = !message.isUser && uiAction?.type === 'media_upload';
    const isActioned = message.aiResponse?.status === 'complete';
    const hasRichCard = isReview || isList || isPicker || isMediaUpload;
    const intentChips = getChipsForIntent(message.aiResponse?.intent);
    const hasIntentChips = !message.isUser && !!intentChips && !!onChipPress;

    // For rich cards we render a full-width column so the card isn't clipped
    // by the avatar width. Text bubble + timestamp still sit inside the normal row.
    // When intent chips are present, render ONLY chips (no message, no cards)
    if (hasIntentChips && hasRichCard && !message.isUser) {
      return (
        <Animated.View
          style={[styles.fullWidthEntry, { opacity: fadeAnim, transform: [{ translateX: slideAnim }] }]}
        >
          <View style={styles.messageRow}>
            <View style={[styles.botAvatarSmall, { backgroundColor: themeColor }]}>
              <Image source={ICONS.APP_ICON} style={{ width: 16, height: 16, tintColor: themeColors.background }} resizeMode="contain" />
            </View>
            <View style={styles.bubbleWrapper}>
              <View style={styles.chipsContainer}>
                {intentChips!.map(chip => (
                  <TouchableOpacity
                    key={chip}
                    style={[styles.chip, { borderColor: themeColor }]}
                    onPress={() => onChipPress!(chip)}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.chipText, { color: themeColor }]}>{chip}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <Text style={[styles.timestamp, styles.botTimestamp]}>
                {formatTime(message.timestamp)}
              </Text>
            </View>
          </View>
        </Animated.View>
      );
    }

    if (hasRichCard && !message.isUser) {
      return (
        <Animated.View
          style={[styles.fullWidthEntry, { opacity: fadeAnim, transform: [{ translateX: slideAnim }] }]}
        >
          {!!message.text && (
            <View style={styles.messageRow}>
              <View style={[styles.botAvatarSmall, { backgroundColor: themeColor }]}>
                <Image source={ICONS.APP_ICON} style={{ width: 16, height: 16, tintColor: themeColors.background }} resizeMode="contain" />
              </View>
              <View style={styles.bubbleWrapper}>
                <View style={styles.botBubble}>
                  <Text style={[styles.messageText, styles.botMessageText]}>
                    <Markdown>{message.text}</Markdown>
                  </Text>
                </View>
                {onSpeak && (
                  <TouchableOpacity
                    onPress={() => onSpeak(message.text, message.id)}
                    style={styles.speakerBtn}
                    activeOpacity={0.7}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Ionicons
                      name={speakingId === message.id ? 'stop-circle-outline' : 'volume-high-outline'}
                      size={18}
                      color={speakingId === message.id ? themeColor : colors.gray}
                    />
                  </TouchableOpacity>
                )}
              </View>
            </View>
          )}

          <View style={styles.richCardRow}>
            <View style={styles.avatarPlaceholder} />
            <View style={styles.richCardWrapper}>
              {isReview && uiAction && (
                <ReviewCard
                  uiAction={uiAction}
                  msgId={message.id}
                  isActioned={!!isActioned}
                  themeColor={themeColor}
                  actionLoading={actionLoading}
                  onConfirm={onConfirm}
                  onCancel={onCancel}
                  status={message.aiResponse?.status}
                />
              )}
              {isList && uiAction && (
                <ListCard uiAction={uiAction} themeColor={themeColor} />
              )}
              {isPicker && uiAction && (
                <PickerCard
                  uiAction={uiAction}
                  msgId={message.id}
                  themeColor={themeColor}
                  actionLoading={actionLoading}
                  onPickerSelect={onPickerSelect}
                  onCancel={onCancel}
                  status={message.aiResponse?.status}
                />
              )}
              {isMediaUpload && uiAction && (
                <MediaUploadCard
                  uiAction={uiAction}
                  msgId={message.id}
                  themeColor={themeColor}
                  actionLoading={actionLoading}
                  onMediaAction={onMediaAction}
                  onAttachPress={onAttachPress}
                  onMediaUpload={onMediaUpload}
                  status={message.aiResponse?.status}
                />
              )}
              <Text style={[styles.timestamp, styles.botTimestamp]}>
                {formatTime(message.timestamp)}
              </Text>
            </View>
          </View>
        </Animated.View>
      );
    }

    return (
      <Animated.View
        style={[
          styles.messageRow,
          message.isUser ? styles.userRow : styles.botRow,
          { opacity: fadeAnim, transform: [{ translateX: slideAnim }] },
        ]}
      >
        {!message.isUser && (
          <View style={[styles.botAvatarSmall, { backgroundColor: themeColor }]}>
            <Image
              source={ICONS.APP_ICON}
              style={{ width: 16, height: 16, tintColor: themeColors.background }}
              resizeMode="contain"
            />
          </View>
        )}

        <View style={[styles.bubbleWrapper, message.isUser && styles.userBubbleWrapper]}>
          {/* Image attachment (user messages) */}
          {message.isUser && message.imageUri && (
            <View style={[styles.imageBubble, { backgroundColor: themeColor }]}>
              <Image
                source={{ uri: message.imageUri }}
                style={styles.chatImage}
                resizeMode="cover"
              />
            </View>
          )}
          {/* Document attachment (user messages) — image attachments get a
              thumbnail above; documents (PDF, etc.) get an icon + filename. */}
          {message.isUser && message.documentName && (
            <View style={[styles.documentBubble, { backgroundColor: themeColor }]}>
              <FontAwesome6 name="file" size={18} color={colors.white} />
              <Text style={styles.documentBubbleText} numberOfLines={1}>
                {message.documentName}
              </Text>
            </View>
          )}
          {/* Hide message text entirely when intent chips are present */}
          {!hasIntentChips && !!message.text && (
            <View
              style={[
                styles.bubble,
                message.isUser
                  ? [styles.userBubble, { backgroundColor: themeColor }]
                  : styles.botBubble,
              ]}
            >
              <Text
                style={[
                  styles.messageText,
                  message.isUser ? styles.userMessageText : styles.botMessageText,
                ]}
              >
                <Markdown>{message.text}</Markdown>
              </Text>
            </View>
          )}
          {!hasIntentChips && !message.isUser && onSpeak && !!message.text && (
            <TouchableOpacity
              onPress={() => onSpeak(message.text, message.id)}
              style={styles.speakerBtn}
              activeOpacity={0.7}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons
                name={speakingId === message.id ? 'stop-circle-outline' : 'volume-high-outline'}
                size={18}
                color={speakingId === message.id ? themeColor : colors.gray}
              />
            </TouchableOpacity>
          )}
          {/* Intent-based quick-action chips (no message, just chips) */}
          {hasIntentChips && (
            <View style={styles.chipsContainer}>
              {intentChips!.map(chip => (
                <TouchableOpacity
                  key={chip}
                  style={[styles.chip, { borderColor: themeColor }]}
                  onPress={() => onChipPress!(chip)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.chipText, { color: themeColor }]}>{chip}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
          <Text
            style={[
              styles.timestamp,
              message.isUser ? styles.userTimestamp : styles.botTimestamp,
            ]}
          >
            {formatTime(message.timestamp)}
          </Text>
        </View>
      </Animated.View>
    );
  },
);

MessageBubble.displayName = 'MessageBubble';

export default MessageBubble;

