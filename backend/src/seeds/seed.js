const { sequelize, User, Store, Medicine } = require('../models');
const bcrypt = require('bcryptjs');

const medicinesData = [
  // Critical / Emergency
  { name: 'Epinephrine Auto-Injector (EpiPen)', generic_name: 'Epinephrine', category: 'Emergency / Anaphylaxis', dosage_form: 'Injection', alternatives: 'Adrenaclick, Auvi-Q, Adrenaline 1mg/ml', description: 'Used for emergency treatment of severe allergic reactions (anaphylaxis).' },
  { name: 'Nitroglycerin 0.4mg Sublingual', generic_name: 'Nitroglycerin', category: 'Emergency / Cardiac', dosage_form: 'Sublingual Tablet', alternatives: 'Nitrostat, Nitrolingual, Angised', description: 'Used to treat acute angina (chest pain) in people with coronary artery disease.' },
  { name: 'Aspirin 325mg (Emergency Chewable)', generic_name: 'Acetylsalicylic Acid', category: 'Emergency / Cardiac', dosage_form: 'Chewable Tablet', alternatives: 'Ecosprin, Disprin, Bayer Aspirin', description: 'Used in acute coronary syndrome/suspected myocardial infarction.' },
  { name: 'Salbutamol Inhaler 100mcg', generic_name: 'Albuterol / Salbutamol', category: 'Emergency / Respiratory', dosage_form: 'Inhaler', alternatives: 'Asthalin, Ventolin, ProAir HFA', description: 'Fast-acting bronchodilator for acute asthma attack and bronchospasm.' },
  { name: 'Naloxone Nasal Spray 4mg', generic_name: 'Naloxone', category: 'Emergency / Overdose', dosage_form: 'Nasal Spray', alternatives: 'Narcan, Kloxxado', description: 'Emergency treatment of known or suspected opioid overdose.' },
  { name: 'Glucagon Emergency Kit 1mg', generic_name: 'Glucagon', category: 'Emergency / Endocrine', dosage_form: 'Injection', alternatives: 'Baqsimi, GlucaGen', description: 'Emergency treatment of severe hypoglycemia in diabetic patients.' },
  { name: 'Atropine Sulfate 0.6mg/ml', generic_name: 'Atropine', category: 'Emergency / Cardiac', dosage_form: 'Injection', alternatives: 'Atropen', description: 'Used to treat symptomatic bradycardia and organophosphate poisoning.' },
  { name: 'Furosemide 40mg (Lasix)', generic_name: 'Furosemide', category: 'Emergency / Cardiovascular', dosage_form: 'Tablet / Injection', alternatives: 'Lasix, Frusid, Salinex', description: 'Loop diuretic used in acute pulmonary edema and severe hypertension.' },
  { name: 'Dexamethasone 4mg/ml', generic_name: 'Dexamethasone', category: 'Emergency / Corticosteroid', dosage_form: 'Injection / Tablet', alternatives: 'Decadron, Dexona', description: 'Potent anti-inflammatory used for severe croup, brain edema, and acute asthma.' },
  { name: 'Hydrocortisone 100mg Injection', generic_name: 'Hydrocortisone', category: 'Emergency / Endocrine', dosage_form: 'Injection', alternatives: 'Solu-Cortef, Primacort', description: 'Used for acute adrenal crisis and severe allergic emergencies.' },

  // Antibiotics & Anti-infectives
  { name: 'Augmentin 625 Duo', generic_name: 'Amoxicillin + Potassium Clavulanate', category: 'Antibiotics', dosage_form: 'Tablet', alternatives: 'Clavam 625, Moxikind CV 625, Curam 625', description: 'Broad-spectrum antibiotic for respiratory, skin, and urinary tract infections.' },
  { name: 'Azithromycin 500mg', generic_name: 'Azithromycin', category: 'Antibiotics', dosage_form: 'Tablet', alternatives: 'Azithral 500, Zithromax, Azee 500', description: 'Macrolide antibiotic for severe respiratory tract infections.' },
  { name: 'Ceftriaxone 1g Injection', generic_name: 'Ceftriaxone', category: 'Antibiotics / Critical Care', dosage_form: 'Injection', alternatives: 'Monocef 1g, Rocephin, Ceftriax', description: 'Third-generation cephalosporin for severe bacterial infections, meningitis, sepsis.' },
  { name: 'Ciprofloxacin 500mg', generic_name: 'Ciprofloxacin', category: 'Antibiotics', dosage_form: 'Tablet', alternatives: 'Ciplox 500, Cipro, Cifran 500', description: 'Fluoroquinolone for serious gastrointestinal, urinary, and respiratory infections.' },
  { name: 'Doxycycline 100mg', generic_name: 'Doxycycline', category: 'Antibiotics', dosage_form: 'Capsule', alternatives: 'Doxicip, Vibramycin, Minocycline', description: 'Tetracycline antibiotic for bacterial and vector-borne infections.' },
  { name: 'Metronidazole 400mg', generic_name: 'Metronidazole', category: 'Antibiotics / Anti-protozoal', dosage_form: 'Tablet', alternatives: 'Flagyl 400, Metrogyl 400', description: 'Used for anaerobic bacterial and protozoal infections.' },

  // Pain Relief / Analgesics / Anti-inflammatory
  { name: 'Paracetamol 650mg (Dolo 650)', generic_name: 'Acetaminophen / Paracetamol', category: 'Analgesics / Antipyretic', dosage_form: 'Tablet', alternatives: 'Dolo 650, Calpol 650, Crocin 650, Panadol', description: 'High-strength antipyretic and analgesic for acute fever and pain.' },
  { name: 'Tramadol 50mg + Paracetamol 325mg', generic_name: 'Tramadol + Paracetamol', category: 'Analgesics / Moderate Pain', dosage_form: 'Tablet', alternatives: 'Ultracet, Tramazac-P', description: 'Combination opioid analgesic for acute moderate-to-severe pain.' },
  { name: 'Diclofenac Sodium 50mg', generic_name: 'Diclofenac', category: 'NSAIDs', dosage_form: 'Tablet', alternatives: 'Voveran 50, Voltaren, Dicloran', description: 'Nonsteroidal anti-inflammatory drug for acute pain and inflammation.' },
  { name: 'Ibuprofen 400mg + Paracetamol 325mg', generic_name: 'Ibuprofen + Paracetamol', category: 'NSAIDs', dosage_form: 'Tablet', alternatives: 'Combiflam, Brufen Plus', description: 'Fast relief from inflammatory pain, dental pain, and trauma.' },

  // Cardiovascular & Hypertension
  { name: 'Amlodipine 5mg', generic_name: 'Amlodipine Besylate', category: 'Cardiovascular', dosage_form: 'Tablet', alternatives: 'Norvasc, Amlong 5, Stamlo 5', description: 'Calcium channel blocker for hypertension and chronic stable angina.' },
  { name: 'Telmisartan 40mg', generic_name: 'Telmisartan', category: 'Cardiovascular', dosage_form: 'Tablet', alternatives: 'Telma 40, Micardis, Telpres 40', description: 'Angiotensin II receptor blocker for hypertension.' },
  { name: 'Atorvastatin 20mg', generic_name: 'Atorvastatin', category: 'Cardiovascular / Statins', dosage_form: 'Tablet', alternatives: 'Lipitor, Atorva 20, Storvas 20', description: 'HMG-CoA reductase inhibitor for dyslipidemia and cardiovascular prevention.' },
  { name: 'Clopidogrel 75mg', generic_name: 'Clopidogrel', category: 'Cardiovascular / Antiplatelet', dosage_form: 'Tablet', alternatives: 'Plavix, Deplatt 75, Clopilet 75', description: 'Antiplatelet medication used to prevent blood clots in CAD and stroke.' },

  // Diabetes & Insulin
  { name: 'Human Insulin Regular (100 IU/ml)', generic_name: 'Human Insulin (Regular)', category: 'Diabetes / Insulin', dosage_form: 'Vial / Pen', alternatives: 'Humulin R, Actrapid, Novolin R', description: 'Short-acting insulin for acute glycemic control and diabetic emergencies.' },
  { name: 'Insulin Glargine 100 IU/ml (Lantus)', generic_name: 'Insulin Glargine', category: 'Diabetes / Insulin', dosage_form: 'Cartridge / Pen', alternatives: 'Lantus, Basalog, Toujeo', description: 'Long-acting basal insulin for diabetes management.' },
  { name: 'Metformin 500mg SR', generic_name: 'Metformin Hydrochloride', category: 'Diabetes / Oral', dosage_form: 'Tablet', alternatives: 'Glucophage, Glycomet 500 SR, Obimet', description: 'First-line biguanide for type 2 diabetes mellitus.' },

  // Gastrointestinal
  { name: 'Pantoprazole 40mg', generic_name: 'Pantoprazole', category: 'Gastrointestinal / PPI', dosage_form: 'Tablet / IV', alternatives: 'Pantocid 40, Protonix, Pan 40', description: 'Proton pump inhibitor for GERD, gastric ulcers, and acute gastritis.' },
  { name: 'Ondansetron 4mg (Emset / Zofran)', generic_name: 'Ondansetron', category: 'Gastrointestinal / Antiemetic', dosage_form: 'Orally Disintegrating Tablet', alternatives: 'Zofran, Emset 4, Ondem 4', description: '5-HT3 receptor antagonist for acute nausea and vomiting.' },
  { name: 'Oral Rehydration Salts (ORS)', generic_name: 'ORS WHO Formula', category: 'Gastrointestinal / Electrolytes', dosage_form: 'Sachet Powder', alternatives: 'Electral, Walyte, Pedialyte', description: 'Electrolyte replacement for acute dehydration and diarrhea.' },

  // Neurological & Psychiatric
  { name: 'Diazepam 5mg (Valium)', generic_name: 'Diazepam', category: 'Neurological / Anticonvulsant', dosage_form: 'Tablet / IV', alternatives: 'Valium, Calmpose, Dizac', description: 'Benzodiazepine used for acute seizures, severe muscle spasm, and panic.' },
  { name: 'Lorazepam 2mg (Ativan)', generic_name: 'Lorazepam', category: 'Neurological / Benzodiazepine', dosage_form: 'Sublingual Tablet / IV', alternatives: 'Ativan, Trapex, Lopez 2', description: 'Fast-acting medication for status epilepticus and acute anxiety.' },
  { name: 'Levetiracetam 500mg', generic_name: 'Levetiracetam', category: 'Neurological / Antiepileptic', dosage_form: 'Tablet / IV', alternatives: 'Keppra, Levipil 500, Levera 500', description: 'Antiepileptic drug for seizure disorders.' },
];

async function seed() {
  try {
    console.log('🌱 Starting Database Seeding...');
    await sequelize.sync({ force: true });
    console.log('🧹 Cleaned and synchronized tables.');

    // 1. Seed Medicines
    await Medicine.bulkCreate(medicinesData);
    console.log(`💊 Seeded ${medicinesData.length} master medicines.`);

    const passwordHash = await bcrypt.hash('Password@123', 10);
    const adminPasswordHash = await bcrypt.hash('Vaishu@2007', 10);

    // 2. Seed Admin User (Exact Credentials Requested)
    const admin = await User.create({
      name: 'System Administrator',
      email: 'prathameshkshirsagar076@gmail.com',
      password_hash: adminPasswordHash,
      role: 'admin',
      auth_provider: 'email',
      phone: '+91 9876543210',
    });
    console.log('👤 Admin user created: prathameshkshirsagar076@gmail.com (Password: Vaishu@2007)');

    // 3. Seed Patient User
    const patient = await User.create({
      name: 'Sarah Jenkins (Patient)',
      email: 'patient@medemergency.com',
      password_hash: passwordHash,
      role: 'patient',
      auth_provider: 'email',
      phone: '+1 (555) 234-5678',
    });
    console.log('👤 Demo Patient created: patient@medemergency.com (Password: Password@123)');

    const baseLat = 18.5204;
    const baseLng = 73.8567;

    const demoStores = [
      {
        userName: 'Rajesh Sharma',
        email: 'store1@medemergency.com',
        store_name: 'Apollo 24/7 Emergency Pharmacy',
        license_number: 'MH-PUN-2024-88492',
        address: 'Shop 12, Ground Floor, City Center Mall, MG Road',
        phone: '+1 (555) 987-1001',
        latitude: baseLat + 0.008,
        longitude: baseLng + 0.005,
        is_approved: true,
        is_online: true,
        is_active: true,
        operating_hours: '24 Hours / 7 Days',
      },
      {
        userName: 'Dr. Anita Mehta',
        email: 'store2@medemergency.com',
        store_name: 'LifeCare 24x7 Critical Chemist',
        license_number: 'MH-PUN-2023-11029',
        address: '104, Sunrise Avenue, Near Ruby Hospital Junction',
        phone: '+1 (555) 987-1002',
        latitude: baseLat - 0.012,
        longitude: baseLng + 0.008,
        is_approved: true,
        is_online: true,
        is_active: true,
        operating_hours: '24 Hours / 7 Days',
      },
      {
        userName: 'Vikas Deshmukh',
        email: 'store3@medemergency.com',
        store_name: 'MedPlus Express & Trauma Chemist',
        license_number: 'MH-PUN-2022-77218',
        address: 'Plot 45, FC Road, Shivaji Nagar',
        phone: '+1 (555) 987-1003',
        latitude: baseLat + 0.022,
        longitude: baseLng - 0.015,
        is_approved: true,
        is_online: true,
        is_active: true,
        operating_hours: '6:00 AM - 12:00 Midnight',
      },
      {
        userName: 'Karan Malhotra',
        email: 'store4@medemergency.com',
        store_name: 'HealthPoint Super Chemist (Pending Approval)',
        license_number: 'MH-PUN-2024-99881',
        address: '22 Highway Plaza, Aundh Link Road',
        phone: '+1 (555) 987-1004',
        latitude: baseLat + 0.045,
        longitude: baseLng + 0.035,
        is_approved: false,
        is_online: true,
        is_active: true,
        operating_hours: '24 Hours / 7 Days',
      },
      {
        userName: 'Pooja Patil',
        email: 'store5@medemergency.com',
        store_name: 'Reliance MedLife 24/7 (Offline)',
        license_number: 'MH-PUN-2021-33412',
        address: '77 Baner High Street',
        phone: '+1 (555) 987-1005',
        latitude: baseLat + 0.065,
        longitude: baseLng - 0.040,
        is_approved: true,
        is_online: false,
        is_active: true,
        operating_hours: '24 Hours / 7 Days',
      },
    ];

    for (const storeData of demoStores) {
      const user = await User.create({
        name: storeData.userName,
        email: storeData.email,
        password_hash: passwordHash,
        role: 'store',
        auth_provider: 'email',
        phone: storeData.phone,
      });

      await Store.create({
        user_id: user.id,
        store_name: storeData.store_name,
        license_number: storeData.license_number,
        address: storeData.address,
        phone: storeData.phone,
        latitude: storeData.latitude,
        longitude: storeData.longitude,
        is_approved: storeData.is_approved,
        is_online: storeData.is_online,
        is_active: storeData.is_active,
        operating_hours: storeData.operating_hours,
      });
      console.log(`🏥 Seeded store: ${storeData.store_name} (User: ${storeData.email})`);
    }

    console.log('✨ Seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding error:', error);
    process.exit(1);
  }
}

seed();
