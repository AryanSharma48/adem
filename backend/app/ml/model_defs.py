import torch
import torch.nn as nn

class CNNLSTMForecast(nn.Module):
    def __init__(self):
        super(CNNLSTMForecast, self).__init__()
        # Must exactly match ml_training/notebooks/train_model.ipynb architecture
        self.conv1d = nn.Conv1d(in_channels=3, out_channels=16, kernel_size=3, padding=1)
        self.relu = nn.ReLU()
        self.lstm = nn.LSTM(input_size=16, hidden_size=32, batch_first=True)
        self.fc = nn.Linear(32, 24)

    def forward(self, x):
        # x shape: (batch_size, 3 channels, seq_len)
        x = self.conv1d(x)
        x = self.relu(x)
        x = x.transpose(1, 2)        # -> (batch, seq_len, 16)
        lstm_out, _ = self.lstm(x)
        last_out = lstm_out[:, -1, :]  # take final timestep
        return self.fc(last_out)       # -> (batch, 24)
