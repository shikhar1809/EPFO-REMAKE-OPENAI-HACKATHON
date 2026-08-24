import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface VaultDocument {
  refId: string;
  type: 'aadhaar' | 'pan' | 'bank_account' | 'passport';
  verificationState: 'unverified' | 'verified' | 'failed';
  source: 'user_upload' | 'digilocker' | 'uidai' | 'npci';
  createdAt: number;
  updatedAt: number;
  permissions: {
    grantedTo: string[]; // e.g. ['claim_withdrawal', 'kyc_update']
  };
  maskedData: string; // e.g., '********1234'
}

interface VaultState {
  documents: Record<string, VaultDocument>;
  
  // Actions
  addDocument: (doc: Omit<VaultDocument, 'refId' | 'createdAt' | 'updatedAt'>) => string;
  verifyDocument: (refId: string, state: 'verified' | 'failed') => void;
  grantPermission: (refId: string, scope: string) => void;
  revokePermission: (refId: string, scope: string) => void;
  removeDocument: (refId: string) => void;
  getDocumentsByType: (type: VaultDocument['type']) => VaultDocument[];
}

const generateId = () => crypto.randomUUID();

export const useVaultStore = create<VaultState>()(
  persist(
    (set, get) => ({
      documents: {},

      addDocument: (doc) => {
        const refId = generateId();
        const now = Date.now();
        set(state => ({
          documents: {
            ...state.documents,
            [refId]: { ...doc, refId, createdAt: now, updatedAt: now }
          }
        }));
        return refId;
      },

      verifyDocument: (refId, verificationState) => {
        set(state => {
          const doc = state.documents[refId];
          if (!doc) return state;
          return {
            documents: {
              ...state.documents,
              [refId]: { ...doc, verificationState, updatedAt: Date.now() }
            }
          };
        });
      },

      grantPermission: (refId, scope) => {
        set(state => {
          const doc = state.documents[refId];
          if (!doc || doc.permissions.grantedTo.includes(scope)) return state;
          return {
            documents: {
              ...state.documents,
              [refId]: {
                ...doc,
                permissions: { grantedTo: [...doc.permissions.grantedTo, scope] },
                updatedAt: Date.now()
              }
            }
          };
        });
      },

      revokePermission: (refId, scope) => {
        set(state => {
          const doc = state.documents[refId];
          if (!doc) return state;
          return {
            documents: {
              ...state.documents,
              [refId]: {
                ...doc,
                permissions: { grantedTo: doc.permissions.grantedTo.filter(s => s !== scope) },
                updatedAt: Date.now()
              }
            }
          };
        });
      },

      removeDocument: (refId) => {
        set(state => {
          const newDocs = { ...state.documents };
          delete newDocs[refId];
          return { documents: newDocs };
        });
      },

      getDocumentsByType: (type) => {
        return Object.values(get().documents).filter(doc => doc.type === type);
      }
    }),
    {
      name: 'epfo-document-vault',
    }
  )
);
