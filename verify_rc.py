import numpy as np

def test_rc():
    # Units
    R_kOhm = 2.0
    C_uF = 100.0
    dt = 0.01 # 10ms
    tau = R_kOhm * C_uF / 1000.0 # 2.0 * 100 / 1000 = 0.2s
    
    alpha = np.exp(-dt / tau)
    
    # DC Charge test
    v_c = 0.0
    v_s = 10.0
    
    # 1 step update
    v_c_next = v_s * (1 - alpha) + v_c * alpha
    
    # Exact DC at t = dt
    v_c_exact = v_s * (1 - np.exp(-dt / tau))
    
    print(f"DC 1-step error: {v_c_next - v_c_exact}")
    
    # Energy and Charge units
    # C = 100 uF, V = 10 V
    # Q = 100 * 10 = 1000 uC
    # E = 0.5 * 100e-6 * 10^2 = 0.5 * 100e-6 * 100 = 5000e-6 = 0.005 J = 5 mJ
    Q = C_uF * v_s
    E = 0.5 * C_uF * v_s**2 / 1000.0
    print(f"Q (uC): {Q}")
    print(f"E (mJ): {E}")

    # AC Phase test
    # Vs = A sin(wt)
    # Vc = A/sqrt(1+(wT)^2) * sin(wt - arctan(wT))
    # I = C dVc/dt
    # For low freq wT << 1, Vc ~ Vs, Phase lag ~ 0
    # For high freq wT >> 1, Vc ~ Vs / (wT) * sin(wt - 90), Phase lag ~ 90
    
    freq = 1.0 # 1 Hz
    omega = 2 * np.pi * freq
    wT = omega * tau
    expected_gain = 1.0 / np.sqrt(1 + wT**2)
    expected_phase_lag = np.degrees(np.arctan(wT))
    
    print(f"AC expected gain: {expected_gain}")
    print(f"AC expected phase lag: {expected_phase_lag} deg")
    
    # Simulating AC with midpoint Vs for better accuracy
    v_c = 0.0
    t = 0.0
    duration = 5.0
    vs_vals = []
    vc_vals = []
    t_vals = []
    while t < duration:
        # Use Vs at midpoint to improve AC accuracy
        vs_mid = 10.0 * np.sin(omega * (t + dt/2))
        v_c = vs_mid * (1 - alpha) + v_c * alpha
        t += dt
        t_vals.append(t)
        vc_vals.append(v_c)
        vs_vals.append(10.0 * np.sin(omega * t))
        
    # Analyze last cycle
    last_cycle = vc_vals[-int(1.0/dt):]
    actual_gain = np.max(last_cycle) / 10.0
    print(f"AC simulated gain: {actual_gain}")
    
test_rc()
