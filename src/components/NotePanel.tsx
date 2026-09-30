import React, { useEffect, useState } from 'react';
import { StickyNote, X } from 'lucide-react';

interface NotePanelProps {
    open: boolean;
    quote: string;
    onSave: (content: string) => void;
    onClose: () => void;
    onSystem: error is not