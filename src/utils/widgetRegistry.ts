import ClockWidget from '../components/widgets/ClockWidget';
import WeatherWidget from '../components/widgets/WeatherWidget';
import SystemStatusWidget from '../components/widgets/SystemStatusWidget';
import CalendarWidget from '../components/widgets/CalendarWidget';
import NotesWidget from '../components/widgets/NotesWidget';
import NewsWidget from '../components/widgets/NewsWidget';
import CalendarIntegrationWidget from '../components/widgets/CalendarIntegrationWidget';
import EmailWidget from '../components/widgets/EmailWidget';
import HealthWidget from '../components/widgets/HealthWidget';
import IFTTTWidget from '../components/widgets/IFTTTWidget';
import TodoWidget from '../components/widgets/TodoWidget';

export interface WidgetDefinition {
  id: string;
  title: string;
  component: React.ComponentType<any>;
  defaultSize: 'small' | 'medium' | 'large';
  hasSettings: boolean;
}

export const availableWidgets: WidgetDefinition[] = [
  { id: 'clock', title: 'Clock', component: ClockWidget, defaultSize: 'medium', hasSettings: true },
  { id: 'weather', title: 'Weather', component: WeatherWidget, defaultSize: 'medium', hasSettings: true },
  { id: 'system', title: 'System Status', component: SystemStatusWidget, defaultSize: 'medium', hasSettings: false },
  { id: 'calendar', title: 'Calendar', component: CalendarWidget, defaultSize: 'medium', hasSettings: true },
  { id: 'notes', title: 'Notes', component: NotesWidget, defaultSize: 'medium', hasSettings: true },
  { id: 'news', title: 'News', component: NewsWidget, defaultSize: 'medium', hasSettings: true },
  { id: 'googleCalendar', title: 'Google Calendar', component: CalendarIntegrationWidget, defaultSize: 'medium', hasSettings: true },
  { id: 'email', title: 'Email', component: EmailWidget, defaultSize: 'medium', hasSettings: true },
  { id: 'health', title: 'Health', component: HealthWidget, defaultSize: 'medium', hasSettings: true },
  { id: 'ifttt', title: 'IFTTT', component: IFTTTWidget, defaultSize: 'medium', hasSettings: true },
  { id: 'todo', title: 'Todo', component: TodoWidget, defaultSize: 'medium', hasSettings: true },
];

export const getWidgetById = (id: string): WidgetDefinition | undefined => {
  return availableWidgets.find(widget => widget.id === id);
};
