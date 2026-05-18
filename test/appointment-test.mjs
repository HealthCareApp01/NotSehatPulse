const API_URL = 'http://localhost:5000/api';

async function runTest() {
  console.log('🏁 Starting Appointment booking & Cart empty integration test...');

  const uniqueEmail = `test-patient-${Date.now()}@example.com`;
  const signupPayload = {
    name: 'Patient Test CartClear',
    email: uniqueEmail,
    password: 'Password123!',
    role: 'Patient'
  };

  try {
    // 1. Sign up the test patient
    console.log(`\n1. Registering test patient with email: ${uniqueEmail}`);
    const signupRes = await fetch(`${API_URL}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(signupPayload)
    });

    const signupData = await signupRes.json();
    if (!signupData.success) {
      throw new Error(`Signup failed: ${signupData.message}`);
    }

    const { token } = signupData.data;
    console.log('✅ Patient signup successful!');

    // 2. Fetch seeded doctors to book with
    console.log('\n2. Fetching seeded doctors directory...');
    const docRes = await fetch(`${API_URL}/profile/doctors`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const docData = await docRes.json();
    if (!docData.success || docData.data.length === 0) {
      throw new Error('❌ No seeded doctors found! Please run the seeder first.');
    }
    const targetDoctor = docData.data[0];
    const doctorUserId = targetDoctor.userId?._id;
    console.log(`✅ Selected target doctor: ${targetDoctor.userId?.name} (UserID: ${doctorUserId})`);

    // 3. Add a medicine item to the patient's cart
    console.log('\n3. Adding medicine item to cart to test occupancy...');
    // We will use a dummy product ID to populate the cart items list
    const dummyProductId = '60c72b2f9b1d8b2e88a8d111'; 
    const cartRes1 = await fetch(`${API_URL}/cart/add`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        productId: dummyProductId,
        quantity: 2,
        itemModel: 'Medicine'
      })
    });

    const cartData1 = await cartRes1.json();
    if (!cartData1.success) {
      throw new Error(`Add to cart failed: ${cartData1.message}`);
    }
    console.log(`✅ Cart successfully populated! Items count: ${cartData1.data.items.length}`);
    if (cartData1.data.items.length === 0) {
      throw new Error('❌ Cart was expected to have items but is empty!');
    }

    // 4. Book the appointment with the doctor
    console.log(`\n4. Booking appointment with ${targetDoctor.userId?.name}...`);
    const bookRes = await fetch(`${API_URL}/appointments/book`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        doctorId: doctorUserId,
        date: new Date().toISOString(),
        timeSlot: 'Wed (10:00 AM - 1:00 PM)'
      })
    });

    const bookData = await bookRes.json();
    if (!bookData.success) {
      throw new Error(`Booking failed: ${bookData.message}`);
    }
    console.log('✅ Appointment booked successfully!');
    console.log('   Response message:', bookData.message);

    // 5. Fetch cart again and verify it is completely empty!
    console.log('\n5. Fetching patient cart again to assert it has been emptied...');
    const cartRes2 = await fetch(`${API_URL}/cart`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const cartData2 = await cartRes2.json();
    if (!cartData2.success) {
      throw new Error(`Fetch cart failed: ${cartData2.message}`);
    }

    console.log(`✅ Final cart retrieved. Items count: ${cartData2.data.items.length}`);
    if (cartData2.data.items.length !== 0) {
      throw new Error('❌ CART WAS NOT EMPTIED! Items still exist.');
    }

    console.log('\n🎉 ALL CHECKS PASSED SUCCESSFULLY! Cart is automatically cleared in the database on appointment booking.');

  } catch (error) {
    console.error('\n❌ Test failed with error:', error.message);
    process.exit(1);
  }
}

runTest();
