import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { SelectableText } from "@/components/image-analyzer/SelectableText";
import { 
  Upload, 
  Camera, 
  FileText, 
  Eye, 
  Languages, 
  Sparkles,
  Loader2,
  ImageIcon,
  X,
  Copy,
  Check,
  ArrowLeft,
  BookOpen
} from "lucide-react";
import { Link } from "react-router-dom";

type AnalysisType = "all" | "ocr" | "describe" | "bulgarian";

interface AnalysisResult {
  type: AnalysisType;
  content: string;
  timestamp: Date;
}

export default function ImageAnalyzer() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisType, setAnalysisType] = useState<AnalysisType>("all");
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 20 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please select an image under 20MB",
          variant: "destructive"
        });
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        setSelectedImage(e.target?.result as string);
        setResult(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setSelectedImage(e.target?.result as string);
        setResult(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const analyzeImage = async () => {
    if (!selectedImage) return;

    setIsAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke("analyze-image", {
        body: { imageBase64: selectedImage, analysisType }
      });

      if (error) throw error;

      setResult({
        type: analysisType,
        content: data.analysis,
        timestamp: new Date()
      });

      toast({
        title: "Analysis complete!",
        description: "Your image has been analyzed successfully."
      });
    } catch (error) {
      console.error("Analysis error:", error);
      toast({
        title: "Analysis failed",
        description: error instanceof Error ? error.message : "Failed to analyze image",
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const copyToClipboard = async () => {
    if (result) {
      await navigator.clipboard.writeText(result.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({ title: "Copied to clipboard!" });
    }
  };

  const clearImage = () => {
    setSelectedImage(null);
    setResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const analysisOptions = [
    { value: "all", label: "Full Analysis", icon: Sparkles, description: "Complete image analysis with OCR" },
    { value: "ocr", label: "Extract Text", icon: FileText, description: "OCR - Extract all visible text" },
    { value: "describe", label: "Describe", icon: Eye, description: "Describe what's in the image" },
    { value: "bulgarian", label: "Bulgarian Helper", icon: Languages, description: "Learn Bulgarian from images" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4">
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Image Analyzer
          </h1>
          <p className="text-muted-foreground mt-2">
            Upload an image to extract text, get descriptions, or learn Bulgarian vocabulary
          </p>
        </motion.div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Upload Section */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Camera className="w-5 h-5" />
                  Upload Image
                </CardTitle>
                <CardDescription>
                  Drag & drop or click to upload an image
                </CardDescription>
              </CardHeader>
              <CardContent>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />

                {!selectedImage ? (
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => fileInputRef.current?.click()}
                    onDrop={handleDrop}
                    onDragOver={(e) => e.preventDefault()}
                    className="border-2 border-dashed border-muted-foreground/30 rounded-xl p-12 text-center cursor-pointer hover:border-primary/50 hover:bg-muted/30 transition-all"
                  >
                    <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">
                      Click to upload or drag and drop
                    </p>
                    <p className="text-sm text-muted-foreground/60 mt-1">
                      PNG, JPG, WEBP up to 20MB
                    </p>
                  </motion.div>
                ) : (
                  <div className="relative">
                    <motion.img
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      src={selectedImage}
                      alt="Selected"
                      className="w-full rounded-xl object-contain max-h-[300px] bg-muted"
                    />
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2"
                      onClick={clearImage}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                )}

                {/* Analysis Type Selection */}
                <div className="mt-6">
                  <p className="text-sm font-medium mb-3">Analysis Type</p>
                  <Tabs value={analysisType} onValueChange={(v) => setAnalysisType(v as AnalysisType)}>
                    <TabsList className="grid grid-cols-2 gap-2 h-auto p-1">
                      {analysisOptions.map((option) => (
                        <TabsTrigger
                          key={option.value}
                          value={option.value}
                          className="flex flex-col items-center gap-1 py-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                        >
                          <option.icon className="w-4 h-4" />
                          <span className="text-xs">{option.label}</span>
                        </TabsTrigger>
                      ))}
                    </TabsList>
                  </Tabs>
                  <p className="text-xs text-muted-foreground mt-2 text-center">
                    {analysisOptions.find(o => o.value === analysisType)?.description}
                  </p>
                </div>

                {/* Analyze Button */}
                <Button
                  className="w-full mt-6"
                  size="lg"
                  onClick={analyzeImage}
                  disabled={!selectedImage || isAnalyzing}
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Analyze Image
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* Results Section */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Analysis Results
                  </span>
                  {result && (
                    <Button variant="ghost" size="sm" onClick={copyToClipboard}>
                      {copied ? (
                        <Check className="w-4 h-4 text-green-500" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                  )}
                </CardTitle>
                <CardDescription>
                  {result 
                    ? `${analysisOptions.find(o => o.value === result.type)?.label} - ${result.timestamp.toLocaleTimeString()}`
                    : "Your analysis results will appear here"
                  }
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AnimatePresence mode="wait">
                  {isAnalyzing ? (
                    <motion.div
                      key="loading"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex flex-col items-center justify-center py-12"
                    >
                      <div className="relative">
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        >
                          <Sparkles className="w-12 h-12 text-primary" />
                        </motion.div>
                      </div>
                      <p className="text-muted-foreground mt-4">Analyzing your image...</p>
                      <p className="text-sm text-muted-foreground/60">This may take a few seconds</p>
                    </motion.div>
                  ) : result ? (
                    <motion.div
                      key="result"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="prose prose-sm dark:prose-invert max-w-none"
                    >
                      <SelectableText content={result.content} />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="empty"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex flex-col items-center justify-center py-12 text-muted-foreground"
                    >
                      <ImageIcon className="w-16 h-16 mb-4 opacity-30" />
                      <p>Upload an image to get started</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Tips Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8"
        >
          <Card>
            <CardContent className="pt-6">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="flex gap-3">
                  <FileText className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-sm">OCR Text Extraction</p>
                    <p className="text-xs text-muted-foreground">
                      Extract text from photos of documents, signs, handwriting, and more
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Eye className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-sm">Image Description</p>
                    <p className="text-xs text-muted-foreground">
                      Get detailed descriptions of objects, scenes, and visual elements
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Languages className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-sm">Bulgarian Learning</p>
                    <p className="text-xs text-muted-foreground">
                      Upload Bulgarian text to get translations and pronunciation guides
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
