const API_URL = 'http://localhost:5000/api';

async function runTest() {
  console.log('🏁 Starting Profile separate collection integration test...');

  const uniqueEmail = `test-doctor-${Date.now()}@example.com`;
  const signupPayload = {
    name: 'Dr. Test Integration',
    email: uniqueEmail,
    password: 'Password123!',
    role: 'Doctor'
  };

  try {
    // 1. Sign up the test doctor
    console.log(`\n1. Registering test doctor with email: ${uniqueEmail}`);
    const signupRes = await fetch(`${API_URL}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(signupPayload)
    });

    const signupData = await signupRes.json();
    if (!signupData.success) {
      throw new Error(`Signup failed: ${signupData.message}`);
    }

    const { token, user } = signupData.data;
    console.log('✅ Signup successful! Token received.');

    // 2. Fetch the newly created profile (checking auto-initialization)
    console.log('\n2. Fetching profile (verifying auto-initialization)...');
    const getRes1 = await fetch(`${API_URL}/profile/me`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const getData1 = await getRes1.json();
    if (!getData1.success) {
      throw new Error(`Fetch profile failed: ${getData1.message}`);
    }

    console.log('✅ Fetch successful!');
    console.log('   User details:', getData1.data.user);
    console.log('   Auto-created profile details:', getData1.data.profile);

    // Verify that profile is not null and userId matches
    if (!getData1.data.profile) {
      throw new Error('❌ Profile document was not auto-initialized!');
    }
    console.log('✅ Auto-initialization check PASSED.');

    // 3. Update the description details in the separate collection
    console.log('\n3. Updating profile description (degree, experience, fees, specialization, bio)...');
    const updatePayload = {
      name: 'Dr. Test Integration (Updated Name)',
      degree: 'M.B.B.S, M.D. (Cardiology)',
      experience: 15,
      consultationFee: 750,
      specialization: 'Cardiologist',
      bio: 'Experienced cardiologist specialized in preventive health and vascular disorders.'
    };

    const updateRes = await fetch(`${API_URL}/profile/me`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(updatePayload)
    });

    const updateData = await updateRes.json();
    if (!updateData.success) {
      throw new Error(`Update failed: ${updateData.message}`);
    }

    console.log('✅ Update successful!');
    console.log('   Updated profile response:', updateData.data.profile);

    // 4. Fetch profile again to confirm all values are persisted and populated correctly
    console.log('\n4. Fetching profile again to verify final state...');
    const getRes2 = await fetch(`${API_URL}/profile/me`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const getData2 = await getRes2.json();
    if (!getData2.success) {
      throw new Error(`Fetch profile final check failed: ${getData2.message}`);
    }

    const finalUser = getData2.data.user;
    const finalProfile = getData2.data.profile;

    console.log('✅ Final Fetch successful!');
    console.log('   Final User Name:', finalUser.name);
    console.log('   Final Profile Degree:', finalProfile.degree);
    console.log('   Final Profile Experience:', finalProfile.experience);
    console.log('   Final Profile Fee:', finalProfile.consultationFee);
    console.log('   Final Profile Bio:', finalProfile.bio);

    // Assert values
    if (
      finalUser.name === updatePayload.name &&
      finalProfile.degree === updatePayload.degree &&
      finalProfile.experience === updatePayload.experience &&
      finalProfile.consultationFee === updatePayload.consultationFee &&
      finalProfile.specialization === updatePayload.specialization &&
      finalProfile.bio === updatePayload.bio
    ) {
      console.log('✅ Value assertion check PASSED.');
    } else {
      throw new Error('❌ Final values do not match update payload!');
    }

    // 5. Test fetching all doctors
    console.log('\n5. Fetching all doctors from directory...');
    const docRes1 = await fetch(`${API_URL}/profile/doctors`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const docData1 = await docRes1.json();
    if (!docData1.success) {
      throw new Error(`Fetch doctors failed: ${docData1.message}`);
    }
    console.log(`✅ Fetch doctors successful! Found ${docData1.data.length} doctor(s).`);

    // Verify that the doctor we created is in the list
    const foundDoc = docData1.data.find(d => d.userId?.email === uniqueEmail);
    if (!foundDoc) {
      throw new Error('❌ Created doctor was not found in the doctor directory!');
    }
    console.log('✅ Created doctor verified in directory.');

    // 6. Test searching by name
    console.log('\n6. Testing directory search by doctor name ("Dr. Test")...');
    const docRes2 = await fetch(`${API_URL}/profile/doctors?search=Dr.+Test`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const docData2 = await docRes2.json();
    if (!docData2.success) {
      throw new Error(`Search by name failed: ${docData2.message}`);
    }
    const foundDocByName = docData2.data.find(d => d.userId?.email === uniqueEmail);
    if (!foundDocByName) {
      throw new Error('❌ Search by name did not return the created doctor!');
    }
    console.log('✅ Search by name PASSED.');

    // 7. Test searching by specialization
    console.log('\n7. Testing directory search by expertise ("Cardiologist")...');
    const docRes3 = await fetch(`${API_URL}/profile/doctors?search=Cardiologist`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const docData3 = await docRes3.json();
    if (!docData3.success) {
      throw new Error(`Search by expertise failed: ${docData3.message}`);
    }
    const foundDocBySpec = docData3.data.find(d => d.userId?.email === uniqueEmail);
    if (!foundDocBySpec) {
      throw new Error('❌ Search by expertise did not return the created doctor!');
    }
    console.log('✅ Search by expertise PASSED.');

    console.log('\n🎉 ALL CHECKS PASSED SUCCESSFULLY! User descriptions, doctor directory indexing, and name/specialty search APIs are fully integrated.');

  } catch (error) {
    console.error('\n❌ Test failed with error:', error.message);
    process.exit(1);
  }
}

runTest();
