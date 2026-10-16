import numpy as np
import matplotlib.pyplot as plt

def simulate_rc(R_kOhm, C_uF, dt, duration, vs_func, v0=0.0):
    tau = R_kOhm * C_uF / 1000.0  # seconds
    alpha = np.exp(-dt / tau)
    
    t_axis = np.arange(0, duration, dt)
    vc = np.zeros_like(t_axis)
    current = np.zeros_like(t_axis)
    
    v = v0
    for i, t in enumerate(t_axis):
        vs = vs_func(t)
        # Time-stepping formula
        v = v * alpha + vs * (1 - alpha)
        vc[i] = v
        current[i] = (vs - v) / R_kOhm # mA
        
    return t_axis, vc, current

# Case 1: DC Charge
R = 1.0 # kOhm
C = 10.0 # uF
dt = 0.0001
duration = 0.1
t, vc, i = simulate_rc(R, C, dt, duration, lambda t: 5.0)

# Exact DC
tau = R * C / 1000.0
vc_exact = 5.0 * (1 - np.exp(-t / tau))
print(f"DC Max error: {np.max(np.abs(vc - vc_exact))}")

# Case 2: AC
freq = 60
omega = 2 * np.pi * freq
t_ac, vc_ac, i_ac = simulate_rc(R, C, dt, duration, lambda t: 5.0 * np.sin(omega * t))

# Exact AC Steady State
# Vc = (A / sqrt(1 + (w*tau)^2)) * sin(w*t - arctan(w*tau))
A = 5.0
phase_lag = np.arctan(omega * tau)
gain = 1.0 / np.sqrt(1 + (omega * tau)**2)
vc_ac_ss = A * gain * np.sin(omega * t_ac - phase_lag)

# We need to account for the transient to check exactness
# Or just check if it converges to steady state
print(f"AC SS Amplitude ratio: {np.max(vc_ac[-1000:]) / A} (Expected: {gain})")
print(f"AC Phase lag (approx): {np.angle(np.mean(np.exp(1j * (omega * t_ac[-100:] - np.arcsin(vc_ac[-100:]/(A*gain))))))}")
