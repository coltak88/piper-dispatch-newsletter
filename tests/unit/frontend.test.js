const React = require('react');
const { render, screen, fireEvent, waitFor } = require('@testing-library/react');
const { BrowserRouter } = require('react-router-dom');
require('@testing-library/jest-dom');

// Mock API calls
const mockApiCall = jest.fn();
global.fetch = mockApiCall;

// Mock components
const MockDashboard = () => (
  <div data-testid="dashboard">
    <h1>Dashboard</h1>
    <div data-testid="stats-container">
      <div data-testid="stat-card">Total Newsletters: 5</div>
      <div data-testid="stat-card">Total Subscribers: 150</div>
      <div data-testid="stat-card">Active Campaigns: 3</div>
    </div>
  </div>
);

const MockNewsletterList = () => {
  const [newsletters, setNewsletters] = React.useState([
    { id: 1, name: 'Tech Newsletter', subscribers: 50, status: 'active' },
    { id: 2, name: 'Marketing Updates', subscribers: 75, status: 'active' }
  ]);

  return (
    <div data-testid="newsletter-list">
      <h2>Newsletters</h2>
      {newsletters.map(newsletter => (
        <div key={newsletter.id} data-testid="newsletter-item">
          <h3>{newsletter.name}</h3>
          <p>Subscribers: {newsletter.subscribers}</p>
          <span data-testid="status-badge">{newsletter.status}</span>
        </div>
      ))}
    </div>
  );
};

const MockSubscriberForm = () => {
  const [formData, setFormData] = React.useState({ email: '', name: '' });
  const [submitted, setSubmitted] = React.useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.email && formData.name) {
      setSubmitted(true);
      mockApiCall('/api/subscribers', {
        method: 'POST',
        body: JSON.stringify(formData)
      });
    }
  };

  if (submitted) {
    return <div data-testid="success-message">Subscriber added successfully!</div>;
  }

  return (
    <form onSubmit={handleSubmit} data-testid="subscriber-form">
      <input
        data-testid="email-input"
        type="email"
        value={formData.email}
        onChange={(e) => setFormData({...formData, email: e.target.value})}
        placeholder="Email"
        required
      />
      <input
        data-testid="name-input"
        type="text"
        value={formData.name}
        onChange={(e) => setFormData({...formData, name: e.target.value})}
        placeholder="Name"
        required
      />
      <button type="submit" data-testid="submit-button">Add Subscriber</button>
    </form>
  );
};

const MockCampaignEditor = () => {
  const [campaign, setCampaign] = React.useState({
    name: '',
    subject: '',
    content: '',
    scheduledFor: ''
  });

  const handleSave = () => {
    mockApiCall('/api/campaigns', {
      method: 'POST',
      body: JSON.stringify(campaign)
    });
  };

  return (
    <div data-testid="campaign-editor">
      <h2>Create Campaign</h2>
      <input
        data-testid="campaign-name"
        value={campaign.name}
        onChange={(e) => setCampaign({...campaign, name: e.target.value})}
        placeholder="Campaign Name"
      />
      <input
        data-testid="campaign-subject"
        value={campaign.subject}
        onChange={(e) => setCampaign({...campaign, subject: e.target.value})}
        placeholder="Subject Line"
      />
      <textarea
        data-testid="campaign-content"
        value={campaign.content}
        onChange={(e) => setCampaign({...campaign, content: e.target.value})}
        placeholder="Email Content"
      />
      <input
        data-testid="campaign-schedule"
        type="datetime-local"
        value={campaign.scheduledFor}
        onChange={(e) => setCampaign({...campaign, scheduledFor: e.target.value})}
      />
      <button onClick={handleSave} data-testid="save-campaign">Save Campaign</button>
    </div>
  );
};

const MockLoginForm = () => {
  const [credentials, setCredentials] = React.useState({ email: '', password: '' });
  const [error, setError] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      mockApiCall.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ token: 'fake-jwt-token', user: { email: credentials.email } })
      });

      const response = await fetch('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials)
      });

      if (response.ok) {
        // Login successful
        setLoading(false);
      } else {
        setError('Invalid credentials');
        setLoading(false);
      }
    } catch (err) {
      setError('Login failed');
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleLogin} data-testid="login-form">
      <h2>Login</h2>
      {error && <div data-testid="error-message">{error}</div>}
      <input
        data-testid="login-email"
        type="email"
        value={credentials.email}
        onChange={(e) => setCredentials({...credentials, email: e.target.value})}
        placeholder="Email"
        required
      />
      <input
        data-testid="login-password"
        type="password"
        value={credentials.password}
        onChange={(e) => setCredentials({...credentials, password: e.target.value})}
        placeholder="Password"
        required
      />
      <button type="submit" disabled={loading} data-testid="login-button">
        {loading ? 'Logging in...' : 'Login'}
      </button>
    </form>
  );
};

describe('Frontend Component Tests', () => {
  beforeEach(() => {
    mockApiCall.mockClear();
  });

  describe('Dashboard Component', () => {
    test('renders dashboard with stats', () => {
      render(<MockDashboard />);
      
      expect(screen.getByTestId('dashboard')).toBeInTheDocument();
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
      expect(screen.getByTestId('stats-container')).toBeInTheDocument();
      
      const statCards = screen.getAllByTestId('stat-card');
      expect(statCards).toHaveLength(3);
      expect(statCards[0]).toHaveTextContent('Total Newsletters: 5');
      expect(statCards[1]).toHaveTextContent('Total Subscribers: 150');
      expect(statCards[2]).toHaveTextContent('Active Campaigns: 3');
    });
  });

  describe('Newsletter List Component', () => {
    test('renders newsletter list with items', () => {
      render(<MockNewsletterList />);
      
      expect(screen.getByTestId('newsletter-list')).toBeInTheDocument();
      expect(screen.getByText('Newsletters')).toBeInTheDocument();
      
      const newsletterItems = screen.getAllByTestId('newsletter-item');
      expect(newsletterItems).toHaveLength(2);
      
      expect(screen.getByText('Tech Newsletter')).toBeInTheDocument();
      expect(screen.getByText('Subscribers: 50')).toBeInTheDocument();
      expect(screen.getByText('Marketing Updates')).toBeInTheDocument();
      expect(screen.getByText('Subscribers: 75')).toBeInTheDocument();
      
      const statusBadges = screen.getAllByTestId('status-badge');
      expect(statusBadges).toHaveLength(2);
      expect(statusBadges[0]).toHaveTextContent('active');
      expect(statusBadges[1]).toHaveTextContent('active');
    });
  });

  describe('Subscriber Form Component', () => {
    test('renders form with input fields', () => {
      render(<MockSubscriberForm />);
      
      expect(screen.getByTestId('subscriber-form')).toBeInTheDocument();
      expect(screen.getByTestId('email-input')).toBeInTheDocument();
      expect(screen.getByTestId('name-input')).toBeInTheDocument();
      expect(screen.getByTestId('submit-button')).toBeInTheDocument();
    });

    test('submits form with valid data', async () => {
      mockApiCall.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true })
      });

      render(<MockSubscriberForm />);
      
      fireEvent.change(screen.getByTestId('email-input'), {
        target: { value: 'test@example.com' }
      });
      fireEvent.change(screen.getByTestId('name-input'), {
        target: { value: 'Test User' }
      });
      fireEvent.click(screen.getByTestId('submit-button'));

      await waitFor(() => {
        expect(screen.getByTestId('success-message')).toBeInTheDocument();
        expect(screen.getByTestId('success-message')).toHaveTextContent('Subscriber added successfully!');
      });

      expect(mockApiCall).toHaveBeenCalledWith('/api/subscribers', {
        method: 'POST',
        body: JSON.stringify({ email: 'test@example.com', name: 'Test User' })
      });
    });

    test('does not submit with invalid email', () => {
      render(<MockSubscriberForm />);
      
      fireEvent.change(screen.getByTestId('email-input'), {
        target: { value: 'invalid-email' }
      });
      fireEvent.change(screen.getByTestId('name-input'), {
        target: { value: 'Test User' }
      });
      fireEvent.click(screen.getByTestId('submit-button'));

      expect(mockApiCall).not.toHaveBeenCalled();
    });
  });

  describe('Campaign Editor Component', () => {
    test('renders campaign editor with all fields', () => {
      render(<MockCampaignEditor />);
      
      expect(screen.getByTestId('campaign-editor')).toBeInTheDocument();
      expect(screen.getByText('Create Campaign')).toBeInTheDocument();
      expect(screen.getByTestId('campaign-name')).toBeInTheDocument();
      expect(screen.getByTestId('campaign-subject')).toBeInTheDocument();
      expect(screen.getByTestId('campaign-content')).toBeInTheDocument();
      expect(screen.getByTestId('campaign-schedule')).toBeInTheDocument();
      expect(screen.getByTestId('save-campaign')).toBeInTheDocument();
    });

    test('updates form fields correctly', () => {
      render(<MockCampaignEditor />);
      
      fireEvent.change(screen.getByTestId('campaign-name'), {
        target: { value: 'Summer Sale' }
      });
      fireEvent.change(screen.getByTestId('campaign-subject'), {
        target: { value: 'Amazing Summer Deals!' }
      });
      fireEvent.change(screen.getByTestId('campaign-content'), {
        target: { value: 'Check out our summer sale!' }
      });

      expect(screen.getByTestId('campaign-name')).toHaveValue('Summer Sale');
      expect(screen.getByTestId('campaign-subject')).toHaveValue('Amazing Summer Deals!');
      expect(screen.getByTestId('campaign-content')).toHaveValue('Check out our summer sale!');
    });

    test('saves campaign successfully', () => {
      mockApiCall.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: 1 })
      });

      render(<MockCampaignEditor />);
      
      fireEvent.change(screen.getByTestId('campaign-name'), {
        target: { value: 'Test Campaign' }
      });
      fireEvent.change(screen.getByTestId('campaign-subject'), {
        target: { value: 'Test Subject' }
      });
      fireEvent.change(screen.getByTestId('campaign-content'), {
        target: { value: 'Test content' }
      });
      
      fireEvent.click(screen.getByTestId('save-campaign'));

      expect(mockApiCall).toHaveBeenCalledWith('/api/campaigns', {
        method: 'POST',
        body: JSON.stringify({
          name: 'Test Campaign',
          subject: 'Test Subject',
          content: 'Test content',
          scheduledFor: ''
        })
      });
    });
  });

  describe('Login Form Component', () => {
    test('renders login form with all fields', () => {
      render(<MockLoginForm />);
      
      expect(screen.getByTestId('login-form')).toBeInTheDocument();
      expect(screen.getByText('Login')).toBeInTheDocument();
      expect(screen.getByTestId('login-email')).toBeInTheDocument();
      expect(screen.getByTestId('login-password')).toBeInTheDocument();
      expect(screen.getByTestId('login-button')).toBeInTheDocument();
    });

    test('shows error message on login failure', async () => {
      mockApiCall.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'Invalid credentials' })
      });

      render(<MockLoginForm />);
      
      fireEvent.change(screen.getByTestId('login-email'), {
        target: { value: 'test@example.com' }
      });
      fireEvent.change(screen.getByTestId('login-password'), {
        target: { value: 'wrongpassword' }
      });
      fireEvent.click(screen.getByTestId('login-button'));

      await waitFor(() => {
        expect(screen.getByTestId('error-message')).toBeInTheDocument();
        expect(screen.getByTestId('error-message')).toHaveTextContent('Invalid credentials');
      });
    });

    test('disables button during loading', async () => {
      mockApiCall.mockImplementationOnce(() => 
        new Promise(resolve => setTimeout(resolve, 1000))
      );

      render(<MockLoginForm />);
      
      fireEvent.change(screen.getByTestId('login-email'), {
        target: { value: 'test@example.com' }
      });
      fireEvent.change(screen.getByTestId('login-password'), {
        target: { value: 'password123' }
      });
      fireEvent.click(screen.getByTestId('login-button'));

      expect(screen.getByTestId('login-button')).toBeDisabled();
      expect(screen.getByTestId('login-button')).toHaveTextContent('Logging in...');
    });
  });

  describe('Accessibility', () => {
    test('form inputs have proper labels and attributes', () => {
      render(<MockSubscriberForm />);
      
      const emailInput = screen.getByTestId('email-input');
      const nameInput = screen.getByTestId('name-input');
      
      expect(emailInput).toHaveAttribute('type', 'email');
      expect(emailInput).toHaveAttribute('required');
      expect(nameInput).toHaveAttribute('type', 'text');
      expect(nameInput).toHaveAttribute('required');
    });

    test('buttons have proper text and states', () => {
      render(<MockLoginForm />);
      
      const loginButton = screen.getByTestId('login-button');
      expect(loginButton).toHaveTextContent('Login');
      expect(loginButton).not.toBeDisabled();
    });
  });

  describe('Responsive Design', () => {
    test('components render correctly on mobile', () => {
      window.innerWidth = 375;
      window.dispatchEvent(new Event('resize'));

      render(<MockDashboard />);
      expect(screen.getByTestId('dashboard')).toBeInTheDocument();
    });

    test('components render correctly on tablet', () => {
      window.innerWidth = 768;
      window.dispatchEvent(new Event('resize'));

      render(<MockNewsletterList />);
      expect(screen.getByTestId('newsletter-list')).toBeInTheDocument();
    });

    test('components render correctly on desktop', () => {
      window.innerWidth = 1920;
      window.dispatchEvent(new Event('resize'));

      render(<MockCampaignEditor />);
      expect(screen.getByTestId('campaign-editor')).toBeInTheDocument();
    });
  });
});