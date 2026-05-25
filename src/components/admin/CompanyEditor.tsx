import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useCompanyStore } from '../../stores/useCompanyStore';
import Input from '../ui/Input';
import Button from '../ui/Button';
import ImageUploader from '../ui/ImageUploader';
import { toast } from '../ui/Toast';

export default function CompanyEditor() {
  const { t } = useTranslation();
  const { company, update } = useCompanyStore();
  const [nameZh, setNameZh] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [nameRu, setNameRu] = useState('');
  const [phone, setPhone] = useState('');
  const [wechatQR, setWechatQR] = useState('');
  const [addrZh, setAddrZh] = useState('');
  const [addrEn, setAddrEn] = useState('');
  const [addrRu, setAddrRu] = useState('');

  useEffect(() => {
    if (company) {
      setNameZh(company.name.zh);
      setNameEn(company.name.en);
      setNameRu(company.name.ru);
      setPhone(company.phone);
      setWechatQR(company.wechatQR);
      setAddrZh(company.address?.zh || '');
      setAddrEn(company.address?.en || '');
      setAddrRu(company.address?.ru || '');
    }
  }, [company]);

  const handleSave = () => {
    update({
      name: { zh: nameZh, en: nameEn, ru: nameRu },
      phone,
      wechatQR,
      address: { zh: addrZh, en: addrEn, ru: addrRu },
    });
    toast(t('common.success'), 'success');
  };

  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">{t('admin.company')}</h3>
      <div className="space-y-4 max-w-xl">
        <div className="grid grid-cols-3 gap-3">
          <Input label={`${t('admin.companyName')} (中文)`} value={nameZh} onChange={(e) => setNameZh(e.target.value)} />
          <Input label="Company Name (EN)" value={nameEn} onChange={(e) => setNameEn(e.target.value)} />
          <Input label="Название (RU)" value={nameRu} onChange={(e) => setNameRu(e.target.value)} />
        </div>
        <Input label={t('admin.phone')} value={phone} onChange={(e) => setPhone(e.target.value)} />
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t('admin.wechatQR')}</label>
          <ImageUploader images={wechatQR ? [wechatQR] : []} onChange={(imgs) => setWechatQR(imgs[0] || '')} />
        </div>
        <div className="grid grid-cols-3 gap-3">
          <Input label={`${t('admin.address')} (中文)`} value={addrZh} onChange={(e) => setAddrZh(e.target.value)} />
          <Input label="Address (EN)" value={addrEn} onChange={(e) => setAddrEn(e.target.value)} />
          <Input label="Адрес (RU)" value={addrRu} onChange={(e) => setAddrRu(e.target.value)} />
        </div>
        <Button onClick={handleSave}>{t('admin.save')}</Button>
      </div>
    </div>
  );
}
