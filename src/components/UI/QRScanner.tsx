import React, { useState } from 'react';
import { QrCode, Camera } from 'lucide-react';
import { Button } from './Button';
import { Input } from './Input';

interface QRScannerProps {
  onScan: (data: string) => void;
}

export const QRScanner: React.FC<QRScannerProps> = ({ onScan }) => {
  const [manualInput, setManualInput] = useState('');
  const [isScanning, setIsScanning] = useState(false);

  const handleManualSubmit = () => {
    if (manualInput.trim()) {
      onScan(manualInput.trim());
      setManualInput('');
    }
  };

  const simulateQRScan = () => {
    setIsScanning(true);
    // Simulate QR scanning delay
    setTimeout(() => {
      const mockQRData = `QR_${Date.now()}`;
      onScan(mockQRData);
      setIsScanning(false);
    }, 2000);
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-[#0e4d3c] rounded-full mb-4">
          <QrCode className="w-8 h-8 text-white" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Scan QR Code
        </h3>
        <p className="text-gray-600">
          Use the camera to scan the student's QR code or enter manually
        </p>
      </div>

      <div className="space-y-4">
        <Button
          onClick={simulateQRScan}
          loading={isScanning}
          className="w-full"
        >
          <Camera className="w-5 h-5 mr-2" />
          {isScanning ? 'Scanning...' : 'Start Camera Scan'}
        </Button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">Or enter manually</span>
          </div>
        </div>

        <div className="flex space-x-2">
          <Input
            placeholder="Enter QR code data"
            value={manualInput}
            onChange={(e) => setManualInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleManualSubmit()}
          />
          <Button onClick={handleManualSubmit} disabled={!manualInput.trim()}>
            Submit
          </Button>
        </div>
      </div>
    </div>
  );
};