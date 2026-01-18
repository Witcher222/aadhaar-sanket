import { motion } from 'framer-motion';
import { CheckCircle, FileText, Lock, Eye, Users, Scale } from 'lucide-react';

const GuidelinesSection = () => {
  const guidelines = [
    {
      icon: Lock,
      title: 'Data Privacy',
      points: [
        'All personal data is encrypted at rest and in transit',
        'Strict access controls based on role and clearance',
        'Regular security audits and compliance checks',
      ],
    },
    {
      icon: Eye,
      title: 'Transparency',
      points: [
        'Complete data lineage tracking',
        'Audit logs for all data access',
        'Regular public reporting of anonymized insights',
      ],
    },
    {
      icon: Users,
      title: 'Ethical Use',
      points: [
        'No individual profiling without consent',
        'Aggregate data only for policy decisions',
        'Human oversight on all AI recommendations',
      ],
    },
    {
      icon: Scale,
      title: 'Compliance',
      points: [
        'Adherent to IT Act 2000 & amendments',
        'GDPR-equivalent data protection standards',
        'Regular third-party compliance audits',
      ],
    },
  ];

  return (
    <section id="guidelines" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-1.5 bg-primary/10 text-primary rounded-full text-sm font-medium mb-4">
            Governance Framework
          </span>
          <h2 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-4">
            Usage <span className="text-primary">Guidelines</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Strict protocols ensuring responsible use of demographic intelligence for public good.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8">
          {guidelines.map((guideline, index) => (
            <motion.div
              key={guideline.title}
              initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.15, duration: 0.5 }}
              className="bg-gradient-to-br from-cream to-white rounded-2xl p-8 border border-border/50 shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <guideline.icon className="w-7 h-7 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-foreground mb-4">{guideline.title}</h3>
                  <ul className="space-y-3">
                    {guideline.points.map((point, pointIndex) => (
                      <motion.li
                        key={pointIndex}
                        initial={{ opacity: 0, x: -10 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.15 + pointIndex * 0.1 }}
                        className="flex items-start gap-2 text-muted-foreground"
                      >
                        <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span>{point}</span>
                      </motion.li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Document Links */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="mt-12 flex flex-wrap justify-center gap-4"
        >
          {['Privacy Policy', 'Terms of Use', 'Data Handling Protocol', 'Compliance Report'].map((doc, index) => (
            <motion.button
              key={doc}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center gap-2 px-6 py-3 bg-white border border-border rounded-xl shadow-sm hover:shadow-md hover:border-primary/30 transition-all"
            >
              <FileText className="w-4 h-4 text-primary" />
              <span className="font-medium text-foreground">{doc}</span>
            </motion.button>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default GuidelinesSection;
