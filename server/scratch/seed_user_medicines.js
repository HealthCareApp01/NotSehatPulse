import mongoose from 'mongoose';
import Medicine from '../models/Medicine.js';
import dotenv from 'dotenv';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/healthcare';

const medicineDataset = [
  {
    name: "Calpol 650mg",
    description: "Used for relieving mild to moderate pain including toothache, headache, and reducing fever.",
    price: 33,
    image: "https://placehold.co/150?text=Calpol+650",
    stock: 120,
    brand: "GSK Pharmaceuticals",
    category: "Analgesic / Antipyretic",
    tabletsPerPacket: 15
  },
  {
    name: "Glycomet 500mg",
    description: "Oral anti-diabetic medication that helps control blood sugar levels in type 2 diabetes patients.",
    price: 24,
    image: "https://placehold.co/150?text=Glycomet+500",
    stock: 200,
    brand: "USV Private Ltd",
    category: "Anti-Diabetic",
    tabletsPerPacket: 10
  },
  {
    name: "Pan-D Capsule",
    description: "A combination medicine used to treat gastroesophageal reflux disease (Acid Reflux) and peptic ulcer disease.",
    price: 199,
    image: "https://placehold.co/150?text=Pan-D",
    stock: 85,
    brand: "Alkem Laboratories",
    category: "Antacid / Anti-Reflux",
    tabletsPerPacket: 15
  },
  {
    name: "Augmentin 625 DUO",
    description: "An antibiotic used to treat bacterial infections of the lungs, urinary tract, skin, and ears.",
    price: 223,
    image: "https://placehold.co/150?text=Augmentin+625",
    stock: 50,
    brand: "GSK Pharmaceuticals",
    category: "Antibiotic",
    tabletsPerPacket: 10
  },
  {
    name: "Atorva 10mg",
    description: "Belongs to a group of medicines called statins. Used to lower cholesterol and reduce the risk of heart disease.",
    price: 72,
    image: "https://placehold.co/150?text=Atorva+10",
    stock: 110,
    brand: "Zydus Cadila",
    category: "Cardiovascular / Statins",
    tabletsPerPacket: 15
  },
  {
    name: "Okace
<truncated 16650 bytes>