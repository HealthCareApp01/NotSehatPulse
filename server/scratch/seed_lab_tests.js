import mongoose from 'mongoose';
import dotenv from 'dotenv';
import LabTest from '../models/LabTest.js';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/healthcare';

const labTestDataset = [
  // --- Hematology & Routine Blood ---
  { name: "Complete Blood Count (CBC)", description: "Evaluates overall health and detects a wide range of disorders, including anemia and infection.", price: 350, image: "https://placehold.co/150?text=CBC", category: "Hematology", brand: "Dr. Lal PathLabs" },
  { name: "Hemoglobin (Hb)", description: "Measures the amount of hemoglobin in the blood to check for anemia.", price: 150, image: "https://placehold.co/150?text=Hemoglobin", category: "Hematology", brand: "Metropolis Healthcare" },
  { name: "Erythrocyte Sedimentation Rate (ESR)", description: "A blood test that can reveal inflammatory activity in your body.", price: 180, image: "https://placehold.co/150?text=ESR", category: "Hematology", brand: "Thyrocare" },
  { name: "Peripheral Blood Smear", description: "Microscopic examination of blood cells to diagnose hematological disorders.", price: 250, image: "https://placehold.co/150?text=PBS", category: "Hematology", brand: "SRL Diagnostics" },
  { name: "Platelet Count", description: "Measures the number of platelets in your blood to check for bleeding disorders.", price: 200, image: "https://placehold.co/150?text=Platelet", category: "Hematology", brand: "Apollo Diagnostics" },
  { name: "Bleeding Time & Clotting Time (BT/CT)", description: "Evaluates the blood's ability to coagulate.", price: 250, image: "https://placehold.co/150?text=BT+CT", category: "Hematology", brand: "Dr. Lal PathLabs" },
  { name: "Blood Grouping & Rh Typing", description: "Determines your blood type (A, B, AB, O) and Rh factor.", price: 200, image: "https://placehold.co/150?text=Blood+Group", category: "Hematology", brand: "Metropolis Healthcare" },
  { name: "Absolute Eosinophil Count (AEC)", description: "Checks for allergic reactions or parasitic infections.", price: 180, image: "https://placehold.co/150?text=AEC", category: "Hematology", brand: "Thyrocare" },
  { name: "Reticulocyte Count", description: "Measures how fast red blood cells are made by the bone marrow.", price: 300, image: "https://placehold.co/150?text=Reticulocyte", category: "Hematology", brand: "SRL Diagnostics" },
  { name: "Prothrombin Time (PT/INR)", description: "Measures how long it takes blood to clot, often used to monitor blood-thinning medications.", price: 400, image: "https://placehold.co/150?text=PT+INR", category: "Hematology", brand: "Apollo Diagnostics" },

  // --- Diabetes Profile ---
  { name: "HbA1c (Glycosylated Hemoglobin)", description: "Measures average blood sugar levels over the past 3 months.", price: 500, image: "https://placehold.co/150?text=HbA1c", category: "Diabetes", brand: "Thyrocare" },
  { name: "Fasting Blood Sugar (FBS)", description: "Measures blood glucose after an overnight fast.", price: 100, image: "https://placehold.co/150?text=FBS", category: "Diabetes", brand: "Dr. Lal PathLabs" },
  { name: "Post Prandial Blood Sugar (PPBS)", description: "Measures blood glucose exactly 2 hours after eating a meal.", price: 100, image: "https://placehold.co/150?text=PPBS", category: "Diabetes", brand: "Metropolis Healthcare" },
  { name: "Random Blood Sugar (RBS)", description: "Measures blood glucose at any given time of the day.", price: 90, image: "https://placehold.co/150?text=RBS", category: "Diabetes", brand: "SRL Diagnostics" },
  { name: "Fasting Insulin", description: "Measures insulin production by the pancreas to check for insulin resistance.", price: 650, image: "https://placehold.co/150?text=Insulin", category: "Diabetes", brand: "Apollo Diagnostics" },
  { name: "C-Peptide", description: "Helps tell the difference between type 1 and type 2 diabetes.", price: 850, image: "https://placehold.co/150?text=C-Peptide", category: "Diabetes", brand: "Dr. Lal PathLabs" },
  { name: "Glucose Tolerance Test (GTT)", description: "Diagnoses gestational diabetes and insulin resistance.", price: 450, image: "https://placehold.co/150?text=GTT", category: "Diabetes", brand: "Metropolis Healthcare" },
  { name: "Microalbuminuria (Urine)", description: "Detects very small levels of a blood protein in your urine to spot early kidney damage from diabetes.", price: 400, image: "https://placehold.co/150?text=Microalbumin", category: "Diabetes", brand: "Thyrocare" },
  { name: "Fructosamine", description: "Measures average blood sugar levels over the past 2-3 weeks.", price: 600, image: "https://placehold.co/150?text=Fructosamine", category: "Diabetes", brand: "SRL Diagnostics" },
  { name: "Ketones (Urine)", description: "Checks for the presence of ketones in urine, indicating diabetic ketoacidosis.", price: 150, image: "https://placehold.co/150?text=Ketones", category: "Diabetes", brand: "Apollo Diagnostics" },

  // --- Liver Function Tests (LFT) ---
  { name: "Liver Function Test (LFT)", description: "Comprehensive panel checking bilirubin, enzymes, and proteins to assess liver health.", price: 750, image: "https://placehold.co/150?text=LFT", category: "Biochemistry", brand: "Dr. Lal PathLabs" },
  { name: "SGOT (AST)", description: "Enzyme test to detect liver damage.", price: 200, image: "https://placehold.co/150?text=SGOT", category: "Biochemistry", brand: "Metropolis Healthcare" },
  { name: "SGPT (ALT)", description: "Specific enzyme test for liver disease and hepatitis.", price: 200, image: "https://placehold.co/150?text=SGPT", category: "Biochemistry", brand: "Thyrocare" },
  { name: "Bilirubin (Total, Direct, Indirect)", description: "Diagnoses jaundice, anemia, and liver disease.", price: 250, image: "https://placehold.co/150?text=Bilirubin", category: "Biochemistry", brand: "SRL Diagnostics" },
  { name: "Alkaline Phosphatase (ALP)", description: "Detects liver disease or bone disorders.", price: 220, image: "https://placehold.co/150?text=ALP", category: "Biochemistry", brand: "Apollo Diagnostics" },
  { name: "Serum Albumin", description: "Measures protein made by the liver to check liver and kidney function.", price: 180, image: "https://placehold.co/150?text=Albumin", category: "Biochemistry", brand: "Dr. Lal PathLabs" },
  { name: "Gamma Glutamyl Transferase (GGT)", description: "Sensitive indicator of liver disease and alcohol-related liver damage.", price: 350, image: "https://placehold.co/150?text=GGT", category: "Biochemistry", brand: "Metropolis Healthcare" },
  { name: "Total Protein", description: "Measures total amount of albumin and globulin in your blood.", price: 200, image: "https://placehold.co/150?text=Total+Protein", category: "Biochemistry", brand: "Thyrocare" },
  { name: "A/G Ratio", description: "Calculated ratio of albumin to globulin.", price: 250, image: "https://placehold.co/150?text=A/G+Ratio", category: "Biochemistry", brand: "SRL Diagnostics" },
  { name: "Lactate Dehydrogenase (LDH)", description: "Checks for tissue damage, especially in the liver or heart.", price: 400, image: "https://placehold.co/150?text=LDH", category: "Biochemistry", brand: "Apollo Diagnostics" },

  // --- Kidney Function Tests (KFT) ---
  { name: "Kidney Function Test (KFT)", description: "Comprehensive panel including urea, creatinine, and uric acid.", price: 650, image: "https://placehold.co/150?text=KFT", category: "Biochemistry", brand: "Thyrocare" },
  { name: "Serum Creatinine", description: "Measures how well your kidneys are filtering waste from your blood.", price: 200, image: "https://placehold.co/150?text=Creatinine", category: "Biochemistry", brand: "Dr. Lal PathLabs" },
  { name: "Blood Urea Nitrogen (BUN)", description: "Measures the amount of urea nitrogen in your blood.", price: 180, image: "https://placehold.co/150?text=BUN", category: "Biochemistry", brand: "Metropolis Healthcare" },
  { name: "Uric Acid", description: "Diagnoses gout and helps monitor patients undergoing chemotherapy.", price: 220, image: "https://placehold.co/150?text=Uric+Acid", category: "Biochemistry", brand: "SRL Diagnostics" },
  { name: "Serum Electrolytes (Na, K, Cl)", description: "Measures sodium, potassium, and chloride levels to check fluid balance.", price: 450, image: "https://placehold.co/150?text=Electrolytes", category: "Biochemistry", brand: "Apollo Diagnostics" },
  { name: "Calcium", description: "Checks for bone disease or thyroid/kidney conditions.", price: 200, image: "https://placehold.co/150?text=Calcium", category: "Biochemistry", brand: "Dr. Lal PathLabs" },
  { name: "Phosphorus", description: "Often tested alongside calcium to check kidney and bone health.", price: 220, image: "https://placehold.co/150?text=Phosphorus", category: "Biochemistry", brand: "Thyrocare" },
  { name: "eGFR", description: "Estimated Glomerular Filtration Rate to assess stage of kidney disease.", price: 300, image: "https://placehold.co/150?text=eGFR", category: "Biochemistry", brand: "Metropolis Healthcare" },
  { name: "Urea", description: "Direct measurement of urea in blood.", price: 180, image: "https://placehold.co/150?text=Urea", category: "Biochemistry", brand: "SRL Diagnostics" },
  { name: "Creatinine Clearance (24 Hour Urine)", description: "Compares creatinine in urine and blood to accurately measure kidney function.", price: 550, image: "https://placehold.co/150?text=Cr+Clearance", category: "Biochemistry", brand: "Apollo Diagnostics" },

  // --- Thyroid Profile ---
  { name: "Thyroid Profile (T3, T4, TSH)", description: "Complete check of thyroid gland function.", price: 500, image: "https://placehold.co/150?text=Thyroid+Profile", category: "Hormone", brand: "Thyrocare" },
  { name: "Thyroid Stimulating Hormone (TSH)", description: "Primary test to screen for an underactive or overactive thyroid.", price: 300, image: "https://placehold.co/150?text=TSH", category: "Hormone", brand: "Dr. Lal PathLabs" },
  { name: "Free T3", description: "Measures the active form of the triiodothyronine hormone.", price: 350, image: "https://placehold.co/150?text=Free+T3", category: "Hormone", brand: "Metropolis Healthcare" },
  { name: "Free T4", description: "Measures the active form of the thyroxine hormone.", price: 350, image: "https://placehold.co/150?text=Free+T4", category: "Hormone", brand: "SRL Diagnostics" },
  { name: "Anti-TPO Antibodies", description: "Diagnoses autoimmune thyroid diseases like Hashimoto's.", price: 950, image: "https://placehold.co/150?text=Anti-TPO", category: "Immunology", brand: "Apollo Diagnostics" },

  // --- Lipid Profile (Heart Health) ---
  { name: "Lipid Profile", description: "Comprehensive test measuring total cholesterol, HDL, LDL, and triglycerides.", price: 600, image: "https://placehold.co/150?text=Lipid+Profile", category: "Cardiology", brand: "Dr. Lal PathLabs" },
  { name: "Total Cholesterol", description: "Measures the total amount of cholesterol in the blood.", price: 200, image: "https://placehold.co/150?text=Cholesterol", category: "Cardiology", brand: "Thyrocare" },
  { name: "Triglycerides", description: "Measures a type of fat in the blood linked to heart disease.", price: 250, image: "https://placehold.co/150?text=Triglycerides", category: "Cardiology", brand: "Metropolis Healthcare" },
  { name: "HDL Cholesterol", description: "Measures 'good' cholesterol.", price: 250, image: "https://placehold.co/150?text=HDL", category: "Cardiology", brand: "SRL Diagnostics" },
  { name: "LDL Cholesterol", description: "Measures 'bad' cholesterol.", price: 250, image: "https://placehold.co/150?text=LDL", category: "Cardiology", brand: "Apollo Diagnostics" },

  // --- Vitamins & Minerals ---
  { name: "Vitamin D (25-OH)", description: "Checks for vitamin D deficiency, essential for bone health and immunity.", price: 1200, image: "https://placehold.co/150?text=Vitamin+D", category: "Vitamins", brand: "Thyrocare" },
  { name: "Vitamin B12", description: "Checks for deficiency causing anemia and nervous system issues.", price: 1000, image: "https://placehold.co/150?text=Vitamin+B12", category: "Vitamins", brand: "Dr. Lal PathLabs" },
  { name: "Iron Profile", description: "Measures Serum Iron, TIBC, and Transferrin Saturation.", price: 650, image: "https://placehold.co/150?text=Iron+Profile", category: "Vitamins", brand: "Metropolis Healthcare" },
  { name: "Ferritin", description: "Measures the amount of iron stored in the body.", price: 750, image: "https://placehold.co/150?text=Ferritin", category: "Vitamins", brand: "SRL Diagnostics" },
  { name: "Folic Acid (Folate)", description: "Checks for folate deficiency, crucial during pregnancy and for red blood cell formation.", price: 900, image: "https://placehold.co/150?text=Folic+Acid", category: "Vitamins", brand: "Apollo Diagnostics" },
  { name: "Magnesium", description: "Checks magnesium levels for muscle and nerve function.", price: 400, image: "https://placehold.co/150?text=Magnesium", category: "Vitamins", brand: "Dr. Lal PathLabs" },
  { name: "Zinc", description: "Measures zinc levels, important for wound healing and immune function.", price: 650, image: "https://placehold.co/150?text=Zinc", category: "Vitamins", brand: "Thyrocare" },
  { name: "Transferrin", description: "Measures the main protein that binds and transports iron.", price: 700, image: "https://placehold.co/150?text=Transferrin", category: "Vitamins", brand: "Metropolis Healthcare" },
  { name: "TIBC (Total Iron Binding Capacity)", description: "Measures the blood's capacity to bind iron.", price: 450, image: "https://placehold.co/150?text=TIBC", category: "Vitamins", brand: "SRL Diagnostics" },
  { name: "Copper", description: "Checks for Wilson's disease or copper deficiency.", price: 800, image: "https://placehold.co/150?text=Copper", category: "Vitamins", brand: "Apollo Diagnostics" },

  // --- Infections & Serology ---
  { name: "Widal Test (Typhoid)", description: "Serological test for enteric fever (Typhoid).", price: 250, image: "https://placehold.co/150?text=Widal+Test", category: "Microbiology", brand: "Dr. Lal PathLabs" },
  { name: "Dengue NS1 Antigen", description: "Early detection of Dengue virus infection.", price: 600, image: "https://placehold.co/150?text=Dengue+NS1", category: "Microbiology", brand: "Metropolis Healthcare" },
  { name: "Malaria Parasite (MP) Smear", description: "Blood smear test to detect malaria parasites.", price: 200, image: "https://placehold.co/150?text=Malaria", category: "Microbiology", brand: "Thyrocare" },
  { name: "Chikungunya IgM", description: "Antibody test for Chikungunya virus.", price: 850, image: "https://placehold.co/150?text=Chikungunya", category: "Microbiology", brand: "SRL Diagnostics" },
  { name: "HBsAg (Hepatitis B)", description: "Screening test for Hepatitis B surface antigen.", price: 450, image: "https://placehold.co/150?text=HBsAg", category: "Microbiology", brand: "Apollo Diagnostics" },
  { name: "Anti-HCV (Hepatitis C)", description: "Screening for Hepatitis C antibodies.", price: 750, image: "https://placehold.co/150?text=Anti-HCV", category: "Microbiology", brand: "Dr. Lal PathLabs" },
  { name: "HIV 1 & 2 Antibodies", description: "Screening test for HIV infection.", price: 500, image: "https://placehold.co/150?text=HIV", category: "Microbiology", brand: "Metropolis Healthcare" },
  { name: "VDRL / RPR (Syphilis)", description: "Screening test for syphilis.", price: 300, image: "https://placehold.co/150?text=VDRL", category: "Microbiology", brand: "Thyrocare" },
  { name: "COVID-19 RT-PCR", description: "Gold standard test for detecting SARS-CoV-2.", price: 800, image: "https://placehold.co/150?text=RT-PCR", category: "Microbiology", brand: "SRL Diagnostics" },
  { name: "Typhi Dot", description: "Rapid serological test for typhoid fever.", price: 450, image: "https://placehold.co/150?text=Typhi+Dot", category: "Microbiology", brand: "Apollo Diagnostics" },
  { name: "C-Reactive Protein (CRP)", description: "Marker for inflammation in the body.", price: 450, image: "https://placehold.co/150?text=CRP", category: "Immunology", brand: "Dr. Lal PathLabs" },
  { name: "Urine Routine & Microscopic", description: "General screening for urinary tract infections, kidney disease, and diabetes.", price: 150, image: "https://placehold.co/150?text=Urine+Routine", category: "Pathology", brand: "Metropolis Healthcare" },
  { name: "Stool Routine Examination", description: "Checks for gastrointestinal infections, parasites, and hidden blood.", price: 200, image: "https://placehold.co/150?text=Stool+Routine", category: "Pathology", brand: "Thyrocare" },
  { name: "Urine Culture & Sensitivity", description: "Identifies bacteria causing UTI and determines the best antibiotic.", price: 550, image: "https://placehold.co/150?text=Urine+Culture", category: "Microbiology", brand: "SRL Diagnostics" },
  { name: "Blood Culture", description: "Detects bacterial or fungal infections in the bloodstream.", price: 900, image: "https://placehold.co/150?text=Blood+Culture", category: "Microbiology", brand: "Apollo Diagnostics" },
  { name: "TB Gold (IGRA)", description: "Highly accurate blood test for tuberculosis infection.", price: 2200, image: "https://placehold.co/150?text=TB+Gold", category: "Microbiology", brand: "Dr. Lal PathLabs" },
  { name: "Sputum AFB", description: "Microscopic test for tuberculosis bacteria in sputum.", price: 300, image: "https://placehold.co/150?text=Sputum+AFB", category: "Microbiology", brand: "Metropolis Healthcare" },
  { name: "Scrub Typhus Antibodies", description: "Detects scrub typhus infection, common in tropical fevers.", price: 950, image: "https://placehold.co/150?text=Scrub+Typhus", category: "Microbiology", brand: "Thyrocare" },
  { name: "Mantoux Test", description: "Skin test used to screen for tuberculosis.", price: 250, image: "https://placehold.co/150?text=Mantoux", category: "Microbiology", brand: "SRL Diagnostics" },
  { name: "Procalcitonin", description: "Helps distinguish bacterial infections from viral infections and marks sepsis risk.", price: 1800, image: "https://placehold.co/150?text=Procalcitonin", category: "Immunology", brand: "Apollo Diagnostics" },

  // --- Hormones & Reproductive ---
  { name: "Testosterone (Total)", description: "Measures the primary male sex hormone.", price: 700, image: "https://placehold.co/150?text=Testosterone", category: "Hormone", brand: "Dr. Lal PathLabs" },
  { name: "Estrogen (Estradiol/E2)", description: "Measures the primary female sex hormone.", price: 750, image: "https://placehold.co/150?text=Estrogen", category: "Hormone", brand: "Metropolis Healthcare" },
  { name: "Progesterone", description: "Evaluates ovulation and monitors pregnancy health.", price: 650, image: "https://placehold.co/150?text=Progesterone", category: "Hormone", brand: "Thyrocare" },
  { name: "Prolactin", description: "Investigates unexplained breast milk production, irregular periods, or infertility.", price: 550, image: "https://placehold.co/150?text=Prolactin", category: "Hormone", brand: "SRL Diagnostics" },
  { name: "Follicle Stimulating Hormone (FSH)", description: "Evaluates fertility issues, reproductive organs, or pituitary function.", price: 550, image: "https://placehold.co/150?text=FSH", category: "Hormone", brand: "Apollo Diagnostics" },
  { name: "Luteinizing Hormone (LH)", description: "Evaluates fertility and the onset of puberty.", price: 550, image: "https://placehold.co/150?text=LH", category: "Hormone", brand: "Dr. Lal PathLabs" },
  { name: "Anti-Mullerian Hormone (AMH)", description: "Assesses ovarian reserve and fertility potential in women.", price: 1800, image: "https://placehold.co/150?text=AMH", category: "Hormone", brand: "Metropolis Healthcare" },
  { name: "Cortisol (Morning)", description: "Measures stress hormone levels to check adrenal gland function.", price: 750, image: "https://placehold.co/150?text=Cortisol", category: "Hormone", brand: "Thyrocare" },
  { name: "Parathyroid Hormone (PTH)", description: "Investigates abnormal calcium levels in the blood.", price: 1100, image: "https://placehold.co/150?text=PTH", category: "Hormone", brand: "SRL Diagnostics" },
  { name: "Beta HCG", description: "Confirms pregnancy and monitors high-risk pregnancies.", price: 600, image: "https://placehold.co/150?text=Beta+HCG", category: "Hormone", brand: "Apollo Diagnostics" },

  // --- Specialized, Cancer & Cardiac Markers ---
  { name: "Prostate Specific Antigen (PSA)", description: "Screens for prostate cancer in men.", price: 850, image: "https://placehold.co/150?text=PSA", category: "Oncology", brand: "Dr. Lal PathLabs" },
  { name: "CA-125", description: "Tumor marker primarily used to monitor ovarian cancer.", price: 1200, image: "https://placehold.co/150?text=CA-125", category: "Oncology", brand: "Metropolis Healthcare" },
  { name: "CEA (Carcinoembryonic Antigen)", description: "Tumor marker for colon and rectal cancer monitoring.", price: 1100, image: "https://placehold.co/150?text=CEA", category: "Oncology", brand: "Thyrocare" },
  { name: "D-Dimer", description: "Rules out the presence of a serious blood clot (DVT or PE).", price: 1200, image: "https://placehold.co/150?text=D-Dimer", category: "Cardiology", brand: "SRL Diagnostics" },
  { name: "Troponin I", description: "Rapid test to diagnose a heart attack.", price: 1500, image: "https://placehold.co/150?text=Troponin+I", category: "Cardiology", brand: "Apollo Diagnostics" },
  { name: "NT-proBNP", description: "Diagnoses and evaluates the severity of heart failure.", price: 2500, image: "https://placehold.co/150?text=NT-proBNP", category: "Cardiology", brand: "Dr. Lal PathLabs" },
  { name: "Homocysteine", description: "Assesses risk for heart disease, stroke, and B-vitamin deficiency.", price: 1400, image: "https://placehold.co/150?text=Homocysteine", category: "Cardiology", brand: "Metropolis Healthcare" },
  { name: "CPK (Creatine Phosphokinase)", description: "Detects muscle inflammation and serious muscle damage.", price: 500, image: "https://placehold.co/150?text=CPK", category: "Biochemistry", brand: "Thyrocare" },
  { name: "HLA-B27", description: "Genetic test used to diagnose ankylosing spondylitis and reactive arthritis.", price: 2800, image: "https://placehold.co/150?text=HLA-B27", category: "Genetics", brand: "SRL Diagnostics" },
  { name: "G6PD Deficiency", description: "Checks for a genetic enzyme deficiency that causes red blood cells to break down.", price: 850, image: "https://placehold.co/150?text=G6PD", category: "Genetics", brand: "Apollo Diagnostics" },

  // --- Common Health Packages ---
  { name: "Basic Full Body Checkup", description: "Includes CBC, LFT, KFT, Lipid Profile, and Fasting Sugar (40+ parameters).", price: 999, image: "https://placehold.co/150?text=Basic+Checkup", category: "Health Package", brand: "Thyrocare" },
  { name: "Comprehensive Body Checkup", description: "Includes Basic profile + Thyroid, Vit D, Vit B12, and HbA1c (70+ parameters).", price: 2499, image: "https://placehold.co/150?text=Comprehensive", category: "Health Package", brand: "Dr. Lal PathLabs" },
  { name: "Senior Citizen Health Package", description: "Tailored for the elderly. Includes Calcium, Rheumatoid Factor, and basic organ panels.", price: 1899, image: "https://placehold.co/150?text=Senior+Package", category: "Health Package", brand: "Metropolis Healthcare" },
  { name: "Women's Wellness Package", description: "Includes Iron profile, Thyroid, Calcium, and routine blood tests for female health.", price: 2199, image: "https://placehold.co/150?text=Womens+Health", category: "Health Package", brand: "SRL Diagnostics" },
  { name: "PCOD / PCOS Profile", description: "Includes FSH, LH, Prolactin, Testosterone, Fasting Insulin, and Thyroid.", price: 2999, image: "https://placehold.co/150?text=PCOD+Profile", category: "Health Package", brand: "Apollo Diagnostics" },
  { name: "Healthy Heart Package", description: "Includes advanced lipid profile, hs-CRP, Homocysteine, and fasting sugar.", price: 1799, image: "https://placehold.co/150?text=Heart+Package", category: "Health Package", brand: "Dr. Lal PathLabs" },
  { name: "Pre-Marital Health Checkup", description: "Screens for blood group compatibility, HIV, VDRL, HBsAg, and genetic markers like Thalassemia.", price: 3499, image: "https://placehold.co/150?text=Pre-Marital", category: "Health Package", brand: "Metropolis Healthcare" },
  { name: "Fever Panel (Advanced)", description: "Includes Malaria, Dengue NS1, Widal, CBC, Urine Routine, and SGPT.", price: 1599, image: "https://placehold.co/150?text=Fever+Panel", category: "Health Package", brand: "Thyrocare" },
  { name: "Arthritis / Joint Pain Profile", description: "Includes Uric Acid, Calcium, Rheumatoid Factor (RA), CRP, and ESR.", price: 1299, image: "https://placehold.co/150?text=Arthritis", category: "Health Package", brand: "SRL Diagnostics" },
  { name: "Hair Fall Screening Profile", description: "Includes Thyroid profile, Iron profile, Vit D, Vit B12, and Zinc.", price: 2299, image: "https://placehold.co/150?text=Hair+Fall", category: "Health Package", brand: "Apollo Diagnostics" }
];

const seedLabTests = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB database server.');

    // Clear existing data
    await LabTest.deleteMany({});
    console.log('Cleared existing lab test entries.');

    // Insert dataset
    await LabTest.insertMany(labTestDataset);
    console.log('Successfully seeded database with 100 Lab Tests & Health Packages!');

  } catch (error) {
    console.error('Error encountered while seeding lab tests:', error);
  } finally {
    mongoose.connection.close();
  }
};

seedLabTests();
