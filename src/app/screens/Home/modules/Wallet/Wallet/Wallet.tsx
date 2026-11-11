import React, { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  ActivityIndicator
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import {
  ShareModal,
  DeleteConfirmModal,
  RemoteImage,
  ViewDetailModal,
  PrimaryButton
} from '../../../../../../components/common';
import { useUserRole } from '../../../../../../hooks/useUserRole';
import { useSubscriptionGate } from '../../../../../../hooks/useSubscriptionGate';
import { useSelectedBusiness } from '../../../../../../hooks/useSelectedBusiness';
import colors, { getColorWithOpacity } from '../../../../../../utils/colors';
import { ICONS } from '../../../../../../utils/Images';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  useFocusEffect,
  useNavigation,
  useRoute
} from '@react-navigation/native';
import { Document, ShareData, WalletNavigationProp } from './Wallet.types';
import { walletAsync, walletToggleAsync } from '../../../../../../redux/services/essentialsService';
import { ASYNC_STATUS } from '../../../../../../config/constants';
import { sharingSyncService } from '../../../../../../redux/services/sharingService';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { resetShareSyncStatus } from '../../../../../../redux/slices/sharingSlice';
import {
  getModuleWriteAccess,
  getEntityWriteAccess
} from '../../../../../../utils/accessLevel';
import type { DetailModalData } from '../../../../../../types/viewDetailModal.types';
import {
  getDriverLicenseClassOptionsAsync,
  getDropdownOptionsAsync
} from '../../../../../../redux/services/authService';
import { AppDispatch } from '../../../../../../types/store.types';
import SharedWithMeSection, { SharedWithMeOwner } from '../../../../../../components/SharedWithMe/SharedWithMeSection';
import { getWalletSharedWithMeAsync } from '../../../../../../redux/services/essentialsService';
import { makeCommonStyles, makeWalletStyles } from '../Wallet.styles';
import { RoleTheme } from '../../../../../../types/roleManager.types';
import { darkenColor } from '../../../../../../utils/roleManager';
import Fontisto from 'react-native-vector-icons/Fontisto';

const resolveLabel = (
  value: string | undefined,
  options: Array<{ label: string; value: string }>,
): string | undefined => {
  if (!value) return undefined;
  return options.find(o => String(o.value) === String(value))?.label || value;
};

const Wallet = (): React.ReactElement => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const { themeColors, isBusinessRole } = useUserRole();
  const commonStyles = useMemo(() => makeCommonStyles(themeColors as RoleTheme), [themeColors]);
  const walletStyles = useMemo(() => makeWalletStyles(themeColors as RoleTheme), [themeColors]);
  const { checkSubscription, GateModal } = useSubscriptionGate();
  const { selectedBusinessId } = useSelectedBusiness();
  const isBusiness = isBusinessRole();
  const route = useRoute<any>();
  const {
    from,
    connectionTabSource,
    sharedWithUserId,
    ownerId,
    accessLevel,
    accessType,
    openEntityId,
  } = route.params || {};
  const isFromEmergencyAccess = from === 'emergency_access';
  const shouldAllowShare = !isFromEmergencyAccess && !accessLevel;
  const showSharedWithMe = !isBusiness && !isFromEmergencyAccess && !connectionTabSource;
  const navigation = useNavigation<WalletNavigationProp>();
  const dispatch = useDispatch<AppDispatch>();
  const {
    get_dropdown_options_data,
    get_driver_license_class_options_data
  } = useSelector((state: any) => state.user_auth);

  const writeAccess = getModuleWriteAccess({
    isFromEmergencyAccess,
    accessType,
    accessLevel
  });
  const getItemWriteAccess = (item: any) =>
    getEntityWriteAccess({
      isFromEmergencyAccess,
      accessType,
      moduleWriteAccess: writeAccess,
      entity: item
    });
  const getConnectionTabQueryParams = () => {
    if (connectionTabSource === 'yours' && sharedWithUserId) {
      return { sharedWithUserId };
    }
    if (connectionTabSource === 'shared_with_you' && ownerId) {
      return { ownerId };
    }
    return {};
  };

  const walletStatus = useSelector(
    (state: any) => state.essentials_slice.wallet_status,
  );
  const walletData = useSelector(
    (state: any) => state.essentials_slice.wallet_data,
  );
  const { share_sync_status } = useSelector(
    (state: any) => state.sharing_slice,
  );
  const { currentConnectionUserId } = useSelector(
    (state: any) => state.connection_slice,
  );

  const walletToggleStatus = useSelector(
    (state: any) => state.essentials_slice.wallet_toggle_status,
  );

  const isLoading = walletStatus === ASYNC_STATUS.LOADING;
  const sharingLoading = share_sync_status === ASYNC_STATUS.LOADING;
  const isRemovingFromWallet = walletToggleStatus === ASYNC_STATUS.LOADING;

  useEffect(() => {
    // In business mode with no business selected, skip fetch to avoid showing personal data
    if (isBusiness && !selectedBusinessId && !isFromEmergencyAccess) {
      return;
    }

    if (isFromEmergencyAccess && currentConnectionUserId) {
      dispatch(
        walletAsync({
          userId: currentConnectionUserId,
          ...getConnectionTabQueryParams()
        }),
      );
    } else {
      dispatch(
        walletAsync({
          ...getConnectionTabQueryParams(),
          // A business's wallet holds only that business's items.
          ...(isBusiness && selectedBusinessId ? { businessId: selectedBusinessId } : {}),
        }),
      );
    }
  }, [
    dispatch,
    isFromEmergencyAccess,
    currentConnectionUserId,
    isBusiness,
    selectedBusinessId,
  ]);

  // In business mode with no business selected, show empty data
  const noBusinessInBusinessMode =
    isBusiness && !selectedBusinessId && !isFromEmergencyAccess;

  const documents: Document[] = useMemo(() => {
    if (noBusinessInBusinessMode || !walletData) return [];
    const result: Document[] = [];

    (walletData.passports || []).forEach((p: any) => {
      result.push({
        id: p.id,
        category: 'passport',
        title: 'Passport',
        passportNumber: p.passportnumber,
        country: p.country?.countryname,
        expirationDate: p.expirationdate
          ? new Date(p.expirationdate).toLocaleDateString()
          : '—',
        type: p.typelabel,
        typelabel: p.typelabel,
        image: p.imageurl
      });
    });

    (walletData.driverlicenses || []).forEach((d: any) => {
      result.push({
        id: d.id,
        category: 'driverLicense',
        title: 'Driver License',
        licenseNumber: d.licensenumber,
        state: d.state,
        statelabel: d.statelabel,
        countryName: d.countryname,
        expirationDate: d.expirationdate
          ? new Date(d.expirationdate).toLocaleDateString()
          : '—',
        class: d.typelabel || d.class,
        typelabel: d.typelabel,
        image: d.imageurl
      });
    });

    (walletData.licensescertifications || []).forEach((lc: any) => {
      result.push({
        id: lc.id,
        category: 'licenseCertification',
        title: lc.typelabel || lc.type || 'License / Certification',
        licenseNumber: lc.licensenumber,
        state: lc.jurisdiction,
        jurisdictionState: lc.jurisdictionstate,
        jurisdictionCountry: lc.jurisdictioncountry,
        expirationDate: lc.expirationdate
          ? new Date(lc.expirationdate).toLocaleDateString()
          : '—',
        type: lc.type,
        typelabel: lc.typelabel,
        issuerAuthority: lc.issuerauthority,
        image: lc.imageurl
      });
    });

    (walletData.properties || []).forEach((pr: any) => {
      result.push({
        id: pr.id,
        category: 'property',
        title: pr.name,
        type: pr.typelabel || pr.category,
        typelabel: pr.typelabel,
        modelSerial: pr.modelserial || undefined,
        price: pr.price != null ? `$${Number(pr.price).toLocaleString()}` : undefined,
        purchaseDate: pr.purchasedate && pr.purchasedate !== '0001-01-01T00:00:00'
          ? new Date(pr.purchasedate).toLocaleDateString()
          : undefined,
        dateSoldDiscarded: pr.datesolddiscarded
          ? new Date(pr.datesolddiscarded).toLocaleDateString()
          : undefined,
        soldAmount: pr.soldamount != null ? `$${Number(pr.soldamount).toLocaleString()}` : undefined,
        business: pr.business || null,
        image: pr.attachment
      });
    });

    (walletData.bankaccounts || walletData.bankAccounts || []).forEach((ba: any) => {
      result.push({
        id: ba.id,
        category: 'bankAccount',
        title: ba.institution || ba.accountname || 'Bank Account',
        accountName: ba.accountname,
        accountType: ba.typelabel || ba.type,
        typelabel: ba.typelabel,
        last4digits: ba.last4digits,
        balance: ba.currentbalance != null ? `$${Number(ba.currentbalance).toLocaleString()}` : undefined,
        apr: ba.apr != null ? `${ba.apr}%` : undefined,
        dueDay: ba.dueday != null ? String(ba.dueday) : undefined,
        minDue: ba.mindue != null ? `$${ba.mindue}` : undefined,
        autoPay: ba.autopay,
        memo: ba.memo,
        image: ba.attachmenturl || ba.imageurl
      });
    });

    (walletData.subscriptions || []).forEach((sp: any) => {
      result.push({
        id: sp.id,
        category: 'subscription',
        title: sp.subscriptionname || 'Membership / Pass',
        type: sp.typelabel || sp.type,
        typelabel: sp.typelabel,
        provider: sp.provider,
        memberName: sp.membername,
        membershipNumber: sp.membershipnumber,
        expirationDate: sp.noexpiration ? t('subscriptions.no_expiration') : sp.enddate ? new Date(sp.enddate).toLocaleDateString() : undefined,
        renewalDate: sp.nextrenewaldate ? new Date(sp.nextrenewaldate).toLocaleDateString() : undefined,
        barcodeValue: sp.barcodevalue,
        issuerAppLink: sp.issuerapplink,
        websiteUrl: sp.websiteurl,
        // The card pictures, front and back, the PDF and the barcode picture.
        image: [sp.cardfronturl, sp.cardbackurl, sp.barcodeimageurl].filter(Boolean),
        pdfId: sp.cardpdfurl || undefined,
      });
    });

    return result;
  }, [walletData, t]);

  const [shareModalVisible, setShareModalVisible] = useState<boolean>(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState<boolean>(false);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(
    null,
  );
  const [viewModalVisible, setViewModalVisible] = useState<boolean>(false);
  const [viewModalData, setViewModalData] = useState<DetailModalData | null>(
    null,
  );
  const [activeDocument, setActiveDocument] = useState<Document | null>(null);

  const autoOpenedRef = useRef(false);
  useEffect(() => {
    if (!openEntityId || autoOpenedRef.current) return;
    if (walletStatus !== ASYNC_STATUS.SUCCEEDED) return;
    const target = documents.find((d: Document) => Number(d.id) === Number(openEntityId));
    if (target) {
      autoOpenedRef.current = true;
      handleEditDocument(target);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openEntityId, walletStatus]);

  const handleAddDocument = useCallback((): void => {
    checkSubscription(() => navigation.navigate(
      'AddWalletDocument' as any,
      accessLevel ? { ownerUserId: currentConnectionUserId } : undefined,
    ));
  }, [navigation, accessLevel, currentConnectionUserId, checkSubscription]);

  const handleShare = useCallback((): void => {
    checkSubscription(() => setShareModalVisible(true), isBusiness ? 'business' : 'personal');
  }, [checkSubscription, isBusiness]);

  const handleShareDocument = useCallback(
    (shareData: ShareData): void => {
      dispatch(
        sharingSyncService({
          resourceType: 'wallet',
          users: shareData
        }),
      );
    },
    [dispatch],
  );

  useEffect(() => {
    if (share_sync_status === ASYNC_STATUS.SUCCEEDED) {
      dispatch(resetShareSyncStatus());
      setShareModalVisible(false);
    }
  }, [share_sync_status, dispatch]);

  useEffect(() => {
    if (share_sync_status === ASYNC_STATUS.ERROR) {
      dispatch(resetShareSyncStatus());
    }
  }, [share_sync_status, dispatch]);

  const handleEditDocument = useCallback(
    (_document: Document): void => {
      const doc = _document;
      const rows: DetailModalData['rows'] = [];

      if (doc.category === 'passport') {
        if (doc.passportNumber || doc.country) {
          rows.push({
            left: { label: t('wallet.passport_number'), value: doc.passportNumber || '—' },
            right: doc.country ? { label: t('wallet.country'), value: doc.country } : undefined
          });
        }
        rows.push({
          left: { label: t('wallet.expiration_date'), value: doc.expirationDate || '—' },
          right: doc.type ? { label: t('wallet.type'), value: doc.type } : undefined
        });
      } else if (doc.category === 'driverLicense') {
        const stateLabel = [doc.statelabel, doc.countryName].filter(Boolean).join(', ');
        if (doc.licenseNumber || stateLabel) {
          rows.push({
            left: { label: t('wallet.license_number'), value: doc.licenseNumber || '—' },
            right: stateLabel ? { label: t('wallet.state'), value: stateLabel } : undefined
          });
        }
        rows.push({
          left: { label: t('wallet.expiration_date'), value: doc.expirationDate || '—' },
          right: doc.class ? { label: t('wallet.class'), value: resolveLabel(doc.class, get_driver_license_class_options_data) || doc.class } : undefined
        });
      } else if (doc.category === 'licenseCertification') {
        const jurisdictionLabel = [doc.jurisdictionState, doc.jurisdictionCountry].filter(Boolean).join(', ');
        if (doc.licenseNumber || jurisdictionLabel) {
          rows.push({
            left: { label: t('wallet.license_number'), value: doc.licenseNumber || '—' },
            right: jurisdictionLabel ? { label: t('wallet.jurisdiction'), value: jurisdictionLabel } : undefined
          });
        }
        if (doc.issuerAuthority) {
          rows.push({
            left: { label: t('wallet.issuer_authority'), value: doc.issuerAuthority }
          });
        }
        rows.push({
          left: { label: t('wallet.expiration_date'), value: doc.expirationDate || '—' },
          right: doc.type ? { label: t('wallet.type'), value: doc.typelabel || resolveLabel(doc.type, get_dropdown_options_data) || doc.type } : undefined
        });
      } else if (doc.category === 'property') {
        if (doc.type || doc.modelSerial) {
          rows.push({
            left: { label: t('wallet.category'), value: doc.type || '—' },
            right: doc.modelSerial ? { label: t('wallet.model_serial'), value: doc.modelSerial } : undefined
          });
        }
        rows.push({
          left: { label: t('wallet.purchase_date'), value: doc.purchaseDate || '—' },
          right: doc.price ? { label: t('wallet.price'), value: String(doc.price) } : undefined
        });
        if (doc.dateSoldDiscarded || doc.soldAmount) {
          rows.push({
            left: { label: t('wallet.date_sold_discarded'), value: doc.dateSoldDiscarded || '—' },
            right: doc.soldAmount ? { label: t('wallet.sold_amount'), value: String(doc.soldAmount) } : undefined
          });
        }
        if (doc.business) {
          rows.push({
            left: { label: t('wallet.business_name'), value: doc.business.businessname || '—' },
            right: doc.business.entitytypelabel || doc.business.entitytype
              ? { label: t('wallet.entity_type'), value: doc.business.entitytypelabel || doc.business.entitytype || '—' }
              : undefined
          });
          if (doc.business.ein || doc.business.stateofformation) {
            rows.push({
              left: { label: t('wallet.ein'), value: doc.business.ein || '—' },
              right: doc.business.stateofformation
                ? { label: t('wallet.state_of_formation'), value: doc.business.stateofformation }
                : undefined
            });
          }
          if (doc.business.principalbusinessaddress) {
            rows.push({
              left: { label: t('wallet.business_address'), value: doc.business.principalbusinessaddress }
            });
          }
          if (doc.business.description) {
            rows.push({
              left: { label: t('wallet.business_description'), value: doc.business.description }
            });
          }
        }
      } else if (doc.category === 'subscription') {
        rows.push({
          left: { label: t('subscriptions.provider'), value: doc.provider || '—' },
          right: doc.type ? { label: t('subscriptions.type'), value: String(doc.type) } : undefined
        });
        if (doc.memberName || doc.membershipNumber) {
          rows.push({
            left: { label: t('subscriptions.member_name'), value: doc.memberName || '—' },
            right: doc.membershipNumber ? { label: t('subscriptions.membership_number'), value: String(doc.membershipNumber), secret: true } : undefined
          });
        }
        if (doc.expirationDate || doc.renewalDate) {
          rows.push({
            left: { label: t('subscriptions.expiration_date'), value: doc.expirationDate || '—' },
            right: doc.renewalDate ? { label: t('subscriptions.renewal_date'), value: doc.renewalDate } : undefined
          });
        }
        if (doc.barcodeValue) {
          rows.push({ left: { label: t('subscriptions.barcode_value'), value: String(doc.barcodeValue) } });
        }
        if (doc.issuerAppLink) {
          rows.push({ left: { label: t('subscriptions.issuer_app_link'), value: String(doc.issuerAppLink) } });
        }
      } else if (doc.category === 'bankAccount') {
        if (doc.accountName || doc.accountType) {
          rows.push({
            left: { label: t('wallet.account_name'), value: doc.accountName || '—' },
            right: doc.accountType ? { label: t('wallet.account_type'), value: doc.accountType } : undefined
          });
        }
        if (doc.last4digits || doc.balance) {
          rows.push({
            left: { label: t('wallet.last_4_digits'), value: doc.last4digits ? `••••${doc.last4digits}` : '—' },
            right: doc.balance ? { label: t('wallet.balance'), value: String(doc.balance) } : undefined
          });
        }
        if (doc.apr || doc.dueDay) {
          rows.push({
            left: { label: t('wallet.apr'), value: doc.apr ? String(doc.apr) : '—' },
            right: doc.dueDay ? { label: t('wallet.due_day'), value: String(doc.dueDay) } : undefined
          });
        }
        if (doc.minDue || doc.autoPay !== undefined) {
          rows.push({
            left: { label: t('wallet.min_due'), value: doc.minDue ? String(doc.minDue) : '—' },
            right: doc.autoPay !== undefined ? { label: t('wallet.auto_pay'), value: doc.autoPay ? t('common.yes') : t('common.no') } : undefined
          });
        }
        if (doc.memo) {
          rows.push({
            left: { label: t('wallet.memo'), value: doc.memo }
          });
        }
      }

      const data: DetailModalData = {
        title: doc.title || t('wallet.document'),
        badge: doc.typelabel || doc.type || doc.accountType || undefined,
        imageId: doc.image || undefined,
        ...(doc.category === 'subscription'
          ? { url: doc.websiteUrl || undefined, documentId: doc.pdfId || undefined }
          : {}),
        rows
      };
      setViewModalData(data);
      setActiveDocument(_document);
      setViewModalVisible(true);
    },
    [t, get_dropdown_options_data, get_driver_license_class_options_data],
  );

  const CATEGORY_TO_MODULE: Record<string, string> = {
    passport: 'passport',
    driverLicense: 'driverlicense',
    licenseCertification: 'licensecertification',
    property: 'property',
    bankAccount: 'bankaccount',
    subscription: 'subscription'
  };

  const CATEGORY_TO_ENTITY_TYPE: Record<string, string> = {
    passport: 'Passport',
    driverLicense: 'DriverLicense',
    licenseCertification: 'LicenseCertification',
    property: 'Property',
    bankAccount: 'BankAccount',
    subscription: 'Subscription'
  };

  const handleRemoveFromWallet = useCallback(() => {
    if (!activeDocument) return;
    const module = CATEGORY_TO_MODULE[activeDocument.category];
    if (!module) return;
    dispatch(walletToggleAsync({ module, itemId: activeDocument.id, isInWallet: false }))
      .unwrap()
      .then(() => {
        setViewModalVisible(false);
        setViewModalData(null);
        setActiveDocument(null);
        dispatch(walletAsync(getConnectionTabQueryParams()));
      })
      .catch(() => { });
  }, [activeDocument, dispatch]);

  const handleDeleteDocument = useCallback((document: Document): void => {
    setSelectedDocument(document);
    setDeleteModalVisible(true);
  }, []);

  const confirmDelete = useCallback((): void => {
    setDeleteModalVisible(false);
    setSelectedDocument(null);
  }, []);

  useFocusEffect(
    useCallback(() => {
      dispatch(getDropdownOptionsAsync('LicenseCertificationType'));
      dispatch(getDriverLicenseClassOptionsAsync('DriverLicenseClass'));
    }, [dispatch]),
  );

  const renderSharedWalletItem = useCallback((item: any, _owner: SharedWithMeOwner): React.ReactNode => {
    const title = item.title || item.name || item.category || 'Wallet Item';
    const badge = item.typelabel || item.category;
    return (
      <TouchableOpacity
        key={item.id}
        style={walletStyles.documentCard}
        onPress={() => {
          const data: DetailModalData = {
            title,
            badge,
            rows: [],
          };
          setViewModalData(data);
          setViewModalVisible(true);
        }}
        activeOpacity={0.7}
      >
        <View style={walletStyles.cardHeader}>
          <Text style={walletStyles.documentTitle}>{title}</Text>
          <View style={walletStyles.actionsRow}>
            <TouchableOpacity
              onPress={() =>
                (navigation as any).navigate('EditHistoryList', {
                  entityType: CATEGORY_TO_ENTITY_TYPE[item.category] || 'Wallet',
                  entityId: item.id,
                  title: t('edit_history.title'),
                })
              }
            >
              <MaterialIcons name="history" size={20} color={themeColors.secondary} />
            </TouchableOpacity>
            {badge ? (
              <Text style={{ color: themeColors.secondary, fontSize: 12 }}>{badge}</Text>
            ) : null}
          </View>
        </View>
      </TouchableOpacity>
    );
  }, [themeColors, setViewModalData, setViewModalVisible, navigation, t]);

  const renderDocumentCard = useCallback(
    (document: Document): React.ReactElement => (
      <TouchableOpacity
        key={`${document.title}-${document.id}`}
        style={walletStyles.documentCard}
        onPress={() => handleEditDocument(document)}
        activeOpacity={0.7}
      >
        <View style={walletStyles.cardHeader}>
          <Text
            style={[
              walletStyles.documentTitle,
              { textAlign: isRTL ? 'right' : 'left' },
            ]}
          >
            {document.title === document.type
              ? resolveLabel(document.type, get_dropdown_options_data) ||
              'License / Certification'
              : document.title}
          </Text>
          <View style={walletStyles.actionsRow}>
          </View>
        </View>
        <View style={walletStyles.cardBody}>
          <View style={walletStyles.cardContentRow}>
            <View style={walletStyles.infoColumn}>
              {/* Passport */}
              {document.category === 'passport' && (
                <>
                  <View style={walletStyles.infoRow}>
                    {document.passportNumber && (
                      <View style={walletStyles.infoItem}>
                        <Text style={[walletStyles.infoLabel, { textAlign: isRTL ? 'right' : 'left' }]}>{t('wallet.passport_number')}</Text>
                        <Text style={[walletStyles.infoValue, { textAlign: isRTL ? 'right' : 'left' }]}>{document.passportNumber}</Text>
                      </View>
                    )}
                    {document.country && (
                      <View style={walletStyles.infoItem}>
                        <Text style={[walletStyles.infoLabel, { textAlign: isRTL ? 'right' : 'left' }]}>{t('wallet.country')}</Text>
                        <Text style={[walletStyles.infoValue, { textAlign: isRTL ? 'right' : 'left' }]}>{document.country}</Text>
                      </View>
                    )}
                  </View>
                  <View style={walletStyles.infoRow}>
                    <View style={walletStyles.infoItem}>
                      <Text style={[walletStyles.infoLabel, { textAlign: isRTL ? 'right' : 'left' }]}>{t('wallet.expiration_date')}</Text>
                      <Text style={[walletStyles.infoValue, { textAlign: isRTL ? 'right' : 'left' }]}>{document.expirationDate || '—'}</Text>
                    </View>
                    {document.typelabel && (
                      <View style={walletStyles.infoItem}>
                        <Text style={[walletStyles.infoLabel, { textAlign: isRTL ? 'right' : 'left' }]}>{t('wallet.type')}</Text>
                        <Text style={[walletStyles.infoValue, { textAlign: isRTL ? 'right' : 'left' }]}>{document.typelabel}</Text>
                      </View>
                    )}
                  </View>
                </>
              )}

              {/* Driver License */}
              {document.category === 'driverLicense' && (
                <>
                  <View style={walletStyles.infoRow}>
                    {document.licenseNumber && (
                      <View style={walletStyles.infoItem}>
                        <Text style={[walletStyles.infoLabel, { textAlign: isRTL ? 'right' : 'left' }]}>{t('wallet.license_number')}</Text>
                        <Text style={[walletStyles.infoValue, { textAlign: isRTL ? 'right' : 'left' }]}>{document.licenseNumber}</Text>
                      </View>
                    )}
                    {(document.statelabel || document.countryName) && (
                      <View style={walletStyles.infoItem}>
                        <Text style={[walletStyles.infoLabel, { textAlign: isRTL ? 'right' : 'left' }]}>{t('wallet.state')}</Text>
                        <Text style={[walletStyles.infoValue, { textAlign: isRTL ? 'right' : 'left' }]}>
                          {[document.statelabel, document.countryName].filter(Boolean).join(', ')}
                        </Text>
                      </View>
                    )}
                  </View>
                  <View style={walletStyles.infoRow}>
                    <View style={walletStyles.infoItem}>
                      <Text style={[walletStyles.infoLabel, { textAlign: isRTL ? 'right' : 'left' }]}>{t('wallet.expiration_date')}</Text>
                      <Text style={[walletStyles.infoValue, { textAlign: isRTL ? 'right' : 'left' }]}>{document.expirationDate || '—'}</Text>
                    </View>
                    {document.typelabel && (
                      <View style={walletStyles.infoItem}>
                        <Text style={[walletStyles.infoLabel, { textAlign: isRTL ? 'right' : 'left' }]}>{t('wallet.class')}</Text>
                        <Text style={[walletStyles.infoValue, { textAlign: isRTL ? 'right' : 'left' }]}>{document.typelabel}</Text>
                      </View>
                    )}
                  </View>
                </>
              )}

              {/* License / Certification */}
              {document.category === 'licenseCertification' && (
                <>
                  <View style={walletStyles.infoRow}>
                    {document.licenseNumber && (
                      <View style={walletStyles.infoItem}>
                        <Text style={[walletStyles.infoLabel, { textAlign: isRTL ? 'right' : 'left' }]}>{t('wallet.license_number')}</Text>
                        <Text style={[walletStyles.infoValue, { textAlign: isRTL ? 'right' : 'left' }]}>{document.licenseNumber}</Text>
                      </View>
                    )}
                    {(document.jurisdictionState || document.jurisdictionCountry) && (
                      <View style={walletStyles.infoItem}>
                        <Text style={[walletStyles.infoLabel, { textAlign: isRTL ? 'right' : 'left' }]}>{t('wallet.jurisdiction')}</Text>
                        <Text style={[walletStyles.infoValue, { textAlign: isRTL ? 'right' : 'left' }]}>
                          {[document.jurisdictionState, document.jurisdictionCountry].filter(Boolean).join(', ')}
                        </Text>
                      </View>
                    )}
                  </View>
                  <View style={walletStyles.infoRow}>
                    <View style={walletStyles.infoItem}>
                      <Text style={[walletStyles.infoLabel, { textAlign: isRTL ? 'right' : 'left' }]}>{t('wallet.expiration_date')}</Text>
                      <Text style={[walletStyles.infoValue, { textAlign: isRTL ? 'right' : 'left' }]}>{document.expirationDate || '—'}</Text>
                    </View>
                    {document.typelabel && (
                      <View style={walletStyles.infoItem}>
                        <Text style={[walletStyles.infoLabel, { textAlign: isRTL ? 'right' : 'left' }]}>{t('wallet.type')}</Text>
                        <Text style={[walletStyles.infoValue, { textAlign: isRTL ? 'right' : 'left' }]}>{document.typelabel}</Text>
                      </View>
                    )}
                  </View>
                </>
              )}

              {/* Property */}
              {document.category === 'property' && (
                <>
                  <View style={walletStyles.infoRow}>
                    {document.typelabel && (
                      <View style={walletStyles.infoItem}>
                        <Text style={[walletStyles.infoLabel, { textAlign: isRTL ? 'right' : 'left' }]}>{t('wallet.category')}</Text>
                        <Text style={[walletStyles.infoValue, { textAlign: isRTL ? 'right' : 'left' }]}>{document.typelabel}</Text>
                      </View>
                    )}
                    {document.modelSerial && (
                      <View style={walletStyles.infoItem}>
                        <Text style={[walletStyles.infoLabel, { textAlign: isRTL ? 'right' : 'left' }]}>{t('wallet.model_serial')}</Text>
                        <Text style={[walletStyles.infoValue, { textAlign: isRTL ? 'right' : 'left' }]}>{document.modelSerial}</Text>
                      </View>
                    )}
                  </View>
                  <View style={walletStyles.infoRow}>
                    {document.purchaseDate && (
                      <View style={walletStyles.infoItem}>
                        <Text style={[walletStyles.infoLabel, { textAlign: isRTL ? 'right' : 'left' }]}>{t('wallet.purchase_date')}</Text>
                        <Text style={[walletStyles.infoValue, { textAlign: isRTL ? 'right' : 'left' }]}>{document.purchaseDate}</Text>
                      </View>
                    )}
                    {document.price && (
                      <View style={walletStyles.infoItem}>
                        <Text style={[walletStyles.infoLabel, { textAlign: isRTL ? 'right' : 'left' }]}>{t('wallet.price')}</Text>
                        <Text style={[walletStyles.infoValue, { textAlign: isRTL ? 'right' : 'left' }]}>{document.price}</Text>
                      </View>
                    )}
                  </View>
                </>
              )}

              {/* Membership / pass */}
              {document.category === 'subscription' && (
                <View style={walletStyles.infoRow}>
                  {document.provider && (
                    <View style={walletStyles.infoItem}>
                      <Text style={[walletStyles.infoLabel, { textAlign: isRTL ? 'right' : 'left' }]}>{t('subscriptions.provider')}</Text>
                      <Text style={[walletStyles.infoValue, { textAlign: isRTL ? 'right' : 'left' }]}>{document.provider}</Text>
                    </View>
                  )}
                  {document.type && (
                    <View style={walletStyles.infoItem}>
                      <Text style={[walletStyles.infoLabel, { textAlign: isRTL ? 'right' : 'left' }]}>{t('subscriptions.type')}</Text>
                      <Text style={[walletStyles.infoValue, { textAlign: isRTL ? 'right' : 'left' }]}>{document.type}</Text>
                    </View>
                  )}
                  {document.expirationDate && (
                    <View style={walletStyles.infoItem}>
                      <Text style={[walletStyles.infoLabel, { textAlign: isRTL ? 'right' : 'left' }]}>{t('subscriptions.expiration_date')}</Text>
                      <Text style={[walletStyles.infoValue, { textAlign: isRTL ? 'right' : 'left' }]}>{document.expirationDate}</Text>
                    </View>
                  )}
                </View>
              )}

              {/* Bank Account */}
              {document.category === 'bankAccount' && (
                <>
                  <View style={walletStyles.infoRow}>
                    {document.accountName && (
                      <View style={walletStyles.infoItem}>
                        <Text style={[walletStyles.infoLabel, { textAlign: isRTL ? 'right' : 'left' }]}>{t('wallet.account_name')}</Text>
                        <Text style={[walletStyles.infoValue, { textAlign: isRTL ? 'right' : 'left' }]}>{document.accountName}</Text>
                      </View>
                    )}
                    {document.accountType && (
                      <View style={walletStyles.infoItem}>
                        <Text style={[walletStyles.infoLabel, { textAlign: isRTL ? 'right' : 'left' }]}>{t('wallet.account_type')}</Text>
                        <Text style={[walletStyles.infoValue, { textAlign: isRTL ? 'right' : 'left' }]}>{document.accountType}</Text>
                      </View>
                    )}
                  </View>
                  <View style={walletStyles.infoRow}>
                    {document.last4digits && (
                      <View style={walletStyles.infoItem}>
                        <Text style={[walletStyles.infoLabel, { textAlign: isRTL ? 'right' : 'left' }]}>{t('wallet.last_4_digits')}</Text>
                        <Text style={[walletStyles.infoValue, { textAlign: isRTL ? 'right' : 'left' }]}>••••{document.last4digits}</Text>
                      </View>
                    )}
                    {document.balance && (
                      <View style={walletStyles.infoItem}>
                        <Text style={[walletStyles.infoLabel, { textAlign: isRTL ? 'right' : 'left' }]}>{t('wallet.balance')}</Text>
                        <Text style={[walletStyles.infoValue, { textAlign: isRTL ? 'right' : 'left' }]}>{document.balance}</Text>
                      </View>
                    )}
                  </View>
                  {(document.apr || document.dueDay) && (
                    <View style={walletStyles.infoRow}>
                      {document.apr && (
                        <View style={walletStyles.infoItem}>
                          <Text style={[walletStyles.infoLabel, { textAlign: isRTL ? 'right' : 'left' }]}>{t('wallet.apr')}</Text>
                          <Text style={[walletStyles.infoValue, { textAlign: isRTL ? 'right' : 'left' }]}>{document.apr}</Text>
                        </View>
                      )}
                      {document.dueDay && (
                        <View style={walletStyles.infoItem}>
                          <Text style={[walletStyles.infoLabel, { textAlign: isRTL ? 'right' : 'left' }]}>{t('wallet.due_day')}</Text>
                          <Text style={[walletStyles.infoValue, { textAlign: isRTL ? 'right' : 'left' }]}>{document.dueDay}</Text>
                        </View>
                      )}
                    </View>
                  )}
                </>
              )}
            </View>
            {document.image ? (
              <RemoteImage
                imageId={document.image[0]}
                style={walletStyles.documentImage}
                resizeMode="cover"
              />
            ) : null}
          </View>
        </View>
      </TouchableOpacity>
    ),
    [
      isRTL,
      t,
      handleEditDocument,
      get_dropdown_options_data,
      get_driver_license_class_options_data,
    ],
  );

  return (
    <LinearGradient
      colors={[...themeColors.gradient.slice(0, 3), themeColors.background]}
      locations={[0, 0.118, 0.2774, 0.4327, 0.5913]}
      style={walletStyles.container}
    >
      <SafeAreaView style={walletStyles.safeArea}>
        {/* Header */}
        <View style={walletStyles.header}>
          <TouchableOpacity
            style={[walletStyles.backButton, { borderColor: themeColors.background }]}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="chevron-back" size={24} color={themeColors.background} />
          </TouchableOpacity>
        </View>

        {/* Content */}
        <ScrollView
          style={walletStyles.scrollView}
          contentContainerStyle={walletStyles.scrollContent}
        >
          {/* Icon */}
          <View style={walletStyles.iconContainer}>
            <Image
              source={ICONS.WALLET_SCREEN_ICON}
              style={walletStyles.walletIcon}
            />
          </View>

          {/* Title */}
          <Text style={[walletStyles.title, { textAlign: isRTL ? 'right' : 'left' }]}>
            {t('wallet.title')}
          </Text>

          {/* Buttons Row */}
          {shouldAllowShare && documents.length > 0 && (
            <PrimaryButton
              icon={<Fontisto name="share-a" size={13} color={colors.black} />}
              title={t('common.share')}
              onPress={() => handleShare()}
              buttonStyle={[walletStyles.shareButton, { backgroundColor: themeColors?.isDark ? getColorWithOpacity(themeColors.primary, 0.8) : getColorWithOpacity(themeColors.primary, 0.5) }]}
              textStyle={[walletStyles.shareButtonText, { color: themeColors?.isDark ? themeColors.background : themeColors.textPrimary }]}
            />
          )}

          {/* Documents List */}
          {isLoading ? (
            <ActivityIndicator
              size="large"
              color={themeColors.primary || colors.white}
              style={walletStyles.loader}
            />
          ) : documents?.length > 0 ? (
            <View style={walletStyles.documentsList}>
              {documents.map(renderDocumentCard)}
            </View>
          ) : (
            <View style={walletStyles.emptyStateContainer}>
              <View style={walletStyles.emptyIconCircle}>
                <AntDesign
                  name="exclamation"
                  size={32}
                  color={colors.gray || '#888'}
                />
              </View>
              <Text style={walletStyles.emptyText}>{t('wallet.no_wallet_documents')}</Text>
            </View>
          )}
          {showSharedWithMe && (
            <SharedWithMeSection
              thunkAction={getWalletSharedWithMeAsync}
              renderItem={renderSharedWalletItem}
            />
          )}
        </ScrollView>
      </SafeAreaView>

      {/* Modals */}
      <ShareModal
        visible={shareModalVisible}
        onClose={() => setShareModalVisible(false)}
        onShare={handleShareDocument}
        title={t('wallet.share_wallet')}
        loading={sharingLoading}
        resourceType={'wallet'}
      />

      <DeleteConfirmModal
        visible={deleteModalVisible}
        onClose={() => setDeleteModalVisible(false)}
        onConfirm={confirmDelete}
        title={t('wallet.delete_confirm')}
      />

      <ViewDetailModal
        visible={viewModalVisible}
        onClose={() => {
          setViewModalVisible(false);
          setViewModalData(null);
          setActiveDocument(null);
        }}
        data={viewModalData}
        onRemoveFromWallet={handleRemoveFromWallet}
        removeFromWalletLoading={isRemovingFromWallet}
      />
      {GateModal}
    </LinearGradient>
  );
};

export default Wallet;
