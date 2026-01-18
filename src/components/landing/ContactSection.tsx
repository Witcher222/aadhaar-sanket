import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Send, Building } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useState } from 'react';
import { toast } from 'sonner';

const ContactSection = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    department: '',
    message: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Message sent successfully! We will respond within 24 hours.');
    setFormData({ name: '', email: '', department: '', message: '' });
  };

  const contactInfo = [
    {
      icon: Building,
      label: 'Ministry of Electronics & IT',
      value: 'Electronics Niketan, CGO Complex, New Delhi',
    },
    {
      icon: Mail,
      label: 'Email',
      value: 'support@aadhaar-sanket.gov.in',
    },
    {
      icon: Phone,
      label: 'Helpline',
      value: '1800-xxx-xxxx (Toll Free)',
    },
    {
      icon: MapPin,
      label: 'Regional Offices',
      value: '28 States & 8 Union Territories',
    },
  ];

  return (
    <section id="contact" className="py-24 bg-gradient-to-b from-white to-cream">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-1.5 bg-primary/10 text-primary rounded-full text-sm font-medium mb-4">
            Get In Touch
          </span>
          <h2 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-4">
            Contact <span className="text-primary">Us</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Have questions or need support? Our team is here to help government agencies and authorized personnel.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-2xl p-8 shadow-xl border border-border/50"
          >
            <h3 className="text-2xl font-bold text-foreground mb-6">Send a Message</h3>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Full Name</label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Your name"
                    className="bg-cream/50 border-border"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Email</label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="your@email.gov.in"
                    className="bg-cream/50 border-border"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Department / Organization</label>
                <Input
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  placeholder="Ministry / State Department"
                  className="bg-cream/50 border-border"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Message</label>
                <Textarea
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="How can we help you?"
                  className="bg-cream/50 border-border min-h-[120px]"
                  required
                />
              </div>
              <Button 
                type="submit" 
                className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-6"
              >
                <Send className="w-4 h-4 mr-2" />
                Send Message
              </Button>
            </form>
          </motion.div>

          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="space-y-6"
          >
            {contactInfo.map((item, index) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 + index * 0.1 }}
                whileHover={{ x: 10 }}
                className="flex items-start gap-4 bg-white rounded-xl p-6 shadow-lg border border-border/50 cursor-pointer hover:border-primary/30 transition-all"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <item.icon className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">{item.label}</h4>
                  <p className="text-muted-foreground">{item.value}</p>
                </div>
              </motion.div>
            ))}

            {/* Operating Hours */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.6 }}
              className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl p-6 border border-primary/20"
            >
              <h4 className="font-bold text-foreground mb-3">Operating Hours</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Monday - Friday</span>
                  <span className="font-medium text-foreground">9:00 AM - 6:00 PM IST</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Saturday</span>
                  <span className="font-medium text-foreground">10:00 AM - 2:00 PM IST</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Emergency Support</span>
                  <span className="font-medium text-green-600">24/7 Available</span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
