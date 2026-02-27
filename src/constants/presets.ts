
export const GOV_PRESETS = {
  SSC: {
    photo: { label: 'SSC Photo (50KB)', targetKB: 50, type: 'image' },
    signature: { label: 'SSC Signature (20KB)', targetKB: 20, type: 'image' },
  },
  UPSC: {
    photo: { label: 'UPSC Photo (100KB)', targetKB: 100, type: 'image' },
    document: { label: 'UPSC Document (300KB)', targetKB: 300, type: 'pdf' },
  },
  BANKING: {
    photo: { label: 'IBPS Photo (50KB)', targetKB: 50, type: 'image' },
    signature: { label: 'IBPS Signature (20KB)', targetKB: 20, type: 'image' },
    thumb: { label: 'Left Thumb (50KB)', targetKB: 50, type: 'image' },
  }
} as const;
